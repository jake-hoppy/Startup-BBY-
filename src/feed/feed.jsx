import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import './feed.css';

export function Feed() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [postText, setPostText] = useState('');
  const [postCategory, setPostCategory] = useState('');
  const [posts, setPosts] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [filter, setFilter] = useState('all');
  const [studyTip, setStudyTip] = useState({ text: null, loading: true, error: null });
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatStatus, setChatStatus] = useState('offline');
  const [onlineCount, setOnlineCount] = useState(0);
  const chatWsRef = useRef(null);

  useEffect(() => {
    api('/api/posts')
      .then((res) => (res.ok ? res.json() : []))
      .then(setPosts)
      .catch(() => setPosts([]));
  }, [user?.email]);

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

  const filteredPosts = useMemo(() => {
    if (filter === 'all') return posts;
    return posts.filter((p) => p.category === filter);
  }, [posts, filter]);

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

  async function handleCreatePost(e) {
    e.preventDefault();
    const trimmed = postText.trim();
    if (!trimmed) return;
    try {
      const res = await api('/api/posts', {
        method: 'POST',
        body: JSON.stringify({ text: trimmed, category: postCategory || 'post' }),
      });
      if (res.ok) {
        const created = await res.json();
        setPosts((prev) => [created, ...prev]);
        setPostText('');
        setPostCategory('');
      }
    } catch {
      // ignore
    }
  }

  function authorDisplay(email) {
    if (!email) return '?';
    const part = email.split('@')[0];
    return part.length > 2 ? part.slice(0, 2).toUpperCase() : part.toUpperCase();
  }

  function timeAgo(iso) {
    const d = new Date(iso);
    const sec = (Date.now() - d.getTime()) / 1000;
    if (sec < 60) return 'just now';
    if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
    if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
    if (sec < 604800) return `${Math.floor(sec / 86400)}d ago`;
    return d.toLocaleDateString();
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
            <section className="create-post-section">
              <h2>Create Post</h2>

              <form onSubmit={handleCreatePost}>
                <textarea
                  placeholder="Share a study accomplishment, question, or resource…"
                  rows={4}
                  value={postText}
                  onChange={(e) => setPostText(e.target.value)}
                />

                <div className="post-controls">
                  <select
                    value={postCategory}
                    onChange={(e) => setPostCategory(e.target.value)}
                  >
                    <option value="">Select category</option>
                    <option value="question">Question</option>
                    <option value="accomplishment">Accomplishments</option>
                    <option value="resource">Resource</option>
                  </select>

                  <button type="submit" disabled={!postText.trim()}>
                    Post
                  </button>
                </div>
              </form>
            </section>

            <h1>Feed</h1>

            <section className="feed-filters">
              <button
                type="button"
                onClick={() => setFilter('all')}
                aria-pressed={filter === 'all'}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilter('question')}
                aria-pressed={filter === 'question'}
              >
                Questions
              </button>
              <button
                type="button"
                onClick={() => setFilter('accomplishment')}
                aria-pressed={filter === 'accomplishment'}
              >
                Accomplishments
              </button>
              <button
                type="button"
                onClick={() => setFilter('resource')}
                aria-pressed={filter === 'resource'}
              >
                Resources
              </button>
            </section>

            <section className="websocket-placeholder">
              <h2>Live Updates</h2>

              {/* 
                WebSocket Placeholder (for grading):

                This section represents intended real-time functionality.
                In the final app, posts would be pushed live to connected clients
                using WebSockets (or similar real-time technology).

                Example use cases:
                - New posts appear instantly without refresh
                - Live reactions/comments
                - Presence indicators (who is online)
              */}

              <div id="live-status">Waiting for live updates…</div>

              {/* 
                Example future JavaScript (not active yet):

                <script>
                  // const socket = new WebSocket("wss://example.com/feed");
                  //
                  // socket.onopen = () => {
                  //   document.getElementById("live-status").textContent =
                  //     "Connected to live feed";
                  // };
                  //
                  // socket.onmessage = (event) => {
                  //   // const newPost = JSON.parse(event.data);
                  //   // renderNewPost(newPost);
                  // };
                  //
                  // socket.onclose = () => {
                  //   document.getElementById("live-status").textContent =
                  //     "Disconnected from live feed";
                  // };
                </script>
              */}
            </section>

            <section className="posts-section">
              {filteredPosts.length === 0 ? (
                <p className="feed-no-posts">
                  {posts.length === 0
                    ? 'No posts yet. Create one above.'
                    : 'No posts in this category.'}
                </p>
              ) : (
                filteredPosts.map((post) => (
                  <article key={post.id} className="post-card">
                    <div className="post-avatar">{authorDisplay(post.author)}</div>
                    <div className="post-content">
                      <div className="post-header">
                        <span className="post-author">{post.author}</span>
                        <span className="post-meta">
                          {post.category ? post.category + ' · ' : ''}{timeAgo(post.createdAt)}
                        </span>
                      </div>
                      <p className="post-text">{post.text}</p>
                    </div>
                  </article>
                ))
              )}
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
                <p className="feed-upcoming-empty">No upcoming assignments. Add some in <Link to="/todo">To Do</Link>.</p>
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
              <h3>Study Buddies Online</h3>
              <ul>
                no one online
              </ul>
            </section>

            <section className="sidebar-card">
              <h3>Suggested Resources</h3>
              <ul>
                <li>
                  <a href="https://coderpad.io/regular-expression-cheat-sheet/">Regex cheat sheet</a>
                </li>
                <li>
                  <a href="https://masteryls.com/course/1a8c01d0-5e9c-4a7c-8597-55bd5159967e/topic/6d489420-b320-4bc9-b43d-5c041a08b6bf">Git deploy checklist</a>
                </li>
              </ul>
            </section>
          </aside>
        </div>
      </main>
    </>
  );
}
