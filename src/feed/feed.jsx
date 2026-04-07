import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import './feed.css';

export function Feed() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [assignments, setAssignments] = useState([]);
  const [studyTip, setStudyTip] = useState({ text: null, loading: true, error: null });
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatStatus, setChatStatus] = useState('offline');
  const [onlineCount, setOnlineCount] = useState(0);
  const chatWsRef = useRef(null);

  useEffect(() => {
    api('/api/assignments')
      .then((res) => (res.ok ? res.json() : []))
      .then(setAssignments)
      .catch(() => setAssignments([]));
  }, [user?.email]);

  // Third-party API: fetch a short advice-style quote for "Study Tip of the Day"
  useEffect(() => {
    setStudyTip((s) => ({ ...s, loading: true, error: null }));
    fetch('https://api.adviceslip.com/advice')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        const text = data?.slip?.advice || 'Take a short break and review your notes.';
        setStudyTip({ text, loading: false, error: null });
      })
      .catch((err) => {
        setStudyTip((s) => ({ ...s, loading: false, error: err.message || 'Unable to load quote.' }));
      });
  }, []);

  useEffect(() => {
    if (!user?.email) return undefined;
    setChatMessages([]);
    const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${proto}//${window.location.host}/ws`);
    chatWsRef.current = ws;
    setChatStatus('connecting');
    ws.onopen = () => setChatStatus('live');
    ws.onclose = () => {
      chatWsRef.current = null;
      setChatStatus('offline');
    };
    ws.onerror = () => setChatStatus('error');
    ws.onmessage = (ev) => {
      try {
        const d = JSON.parse(ev.data);
        if (d.type === 'presence' && typeof d.count === 'number') setOnlineCount(d.count);
        if (d.type === 'chat') setChatMessages((prev) => [...prev, d]);
      } catch {
        /* ignore */
      }
    };
    return () => {
      chatWsRef.current = null;
      ws.close();
    };
  }, [user?.email]);

  const upcomingDue = useMemo(() => {
    return assignments
      .slice()
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 5);
  }, [assignments]);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  function sendLiveChat(e) {
    e.preventDefault();
    const t = chatInput.trim();
    const ws = chatWsRef.current;
    if (!t || !ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify({ type: 'chat', text: t }));
    setChatInput('');
  }

  return (
    <>
      <header>
        <nav>
          <div className="logo-placeholder">
            <img src="SociallearningLogo.png" alt="Logo" />
          </div>

          <h1 className="site-title">Sociallearning</h1>

          <ul>
            <li>
              <Link to="/home">Home</Link>
            </li>
            <li>
              <Link to="/feed">Feed</Link>
            </li>
            <li>
              <Link to="/todo" aria-current="page">
                To Do
              </Link>
            </li>
          </ul>

          <button type="button" className="nav-logout-link" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </header>

      <main>
        <div className="feed-layout">
          <div className="feed-main">
            <header className="feed-main-header">
              <h1>Feed</h1>
              <p className="feed-page-lead">
                Live study chat — share questions, wins, and resources. Messages show up instantly for
                everyone on this page.
              </p>
            </header>

            <section className="feed-main-live-chat" aria-label="Live chat feed">
              <div className="feed-main-live-chat-header">
                <h2>Live messages</h2>
                <p className="feed-chat-meta">
                  {onlineCount} online ·{' '}
                  {chatStatus === 'live'
                    ? 'Connected'
                    : chatStatus === 'connecting'
                      ? 'Connecting…'
                      : 'Disconnected'}
                </p>
              </div>
              <ul className="feed-chat-messages" aria-live="polite">
                {chatMessages.length === 0 ? (
                  <li className="feed-chat-empty">
                    No messages yet. Open this feed in another window (or ask a classmate to join) to chat
                    in real time.
                  </li>
                ) : (
                  chatMessages.map((m, i) => (
                    <li key={`${m.ts}-${i}`}>
                      <strong>{m.from}:</strong> {m.text}
                    </li>
                  ))
                )}
              </ul>
              <form className="feed-chat-form" onSubmit={sendLiveChat}>
                <textarea
                  placeholder="Share a study question, accomplishment, or resource…"
                  rows={4}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  maxLength={500}
                  autoComplete="off"
                />
                <div className="feed-chat-form-actions">
                  <span className="feed-chat-char-hint">{chatInput.length}/500</span>
                  <button type="submit" disabled={chatStatus !== 'live' || !chatInput.trim()}>
                    Send to feed
                  </button>
                </div>
              </form>
            </section>
          </div>

          <aside className="feed-sidebar">
            <section className="sidebar-card api-placeholder">
              <h3>QUOTE BREAK!!</h3>
              <div className="study-tip-content">
                {studyTip.loading && <p>Loading…</p>}
                {studyTip.error && <p className="study-tip-error">{studyTip.error}</p>}
                {!studyTip.loading && !studyTip.error && studyTip.text && (
                  <p className="study-tip-quote">"{studyTip.text}"</p>
                )}
              </div>
            </section>

            <section className="sidebar-card">
              <h3>Today’s Goal</h3>
              <p>Finish 2 tasks</p>
            </section>

            <section className="sidebar-card">
              <h3>Upcoming Due</h3>
              {upcomingDue.length === 0 ? (
                <p className="feed-upcoming-empty">
                  No upcoming assignments. Add some in <Link to="/todo">To Do</Link>.
                </p>
              ) : (
                <ul className="feed-upcoming-list">
                  {upcomingDue.map((a) => (
                    <li key={a.id}>
                      <strong>{a.className}:</strong> {a.name} – {a.dueDate}
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="sidebar-card">
              <h3>Suggested Resources</h3>
              <ul>
                <li>
                  <a href="https://coderpad.io/regular-expression-cheat-sheet/">Regex cheat sheet</a>
                </li>
                <li>
                  <a href="https://masteryls.com/course/1a8c01d0-5e9c-4a7c-8597-55bd5159967e/topic/6d489420-b320-4bc9-b43d-5c041a08b6bf">
                    Git deploy checklist
                  </a>
                </li>
              </ul>
            </section>
          </aside>
        </div>
      </main>
    </>
  );
}
