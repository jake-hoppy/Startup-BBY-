import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { setCurrentUser, getCurrentUser, getAssignments } from '../auth';
import './home.css';

function formatShortDay(ymd) {
  const d = new Date(ymd + 'T12:00:00');
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[d.getDay()];
}

function getEndOfWeekStr(todayStr) {
  const d = new Date(todayStr + 'T12:00:00');
  const day = d.getDay();
  const daysToSunday = day === 0 ? 0 : 7 - day;
  d.setDate(d.getDate() + daysToSunday);
  return d.toISOString().slice(0, 10);
}

export function Home() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const assignments = useMemo(
    () => (currentUser ? getAssignments(currentUser) : []),
    [currentUser]
  );

  const { overdue, dueSoonCount, nextDue, dueThisWeekCount } = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const endOfWeekStr = getEndOfWeekStr(todayStr);

    const overdueList = assignments
      .filter((a) => a.dueDate < todayStr)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    const upcoming = assignments
      .filter((a) => a.dueDate >= todayStr)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    const nextDueAssignment = upcoming[0] ?? null;
    const dueThisWeek = assignments.filter(
      (a) => a.dueDate >= todayStr && a.dueDate <= endOfWeekStr
    );

    return {
      overdue: overdueList,
      dueSoonCount: upcoming.length,
      nextDue: nextDueAssignment,
      dueThisWeekCount: dueThisWeek.length,
    };
  }, [assignments]);

  function handleLogout() {
    setCurrentUser(null);
    navigate('/login');
  }

  const displayName = currentUser ? currentUser.split('@')[0] : 'there';

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
        <div className="home-layout">
          <div className="home-main">
            <section className="welcome-section">
              <h2>Welcome back, {displayName}</h2>
              <p className="welcome-subtitle">
                Learn together. Stay organized. Share progress.
              </p>

              <div className="stats-grid">
                <div className="stat-card">
                  <p className="stat-label">Due soon</p>
                  <p className="stat-value">{dueSoonCount}</p>
                  <p className="stat-sub">
                    {nextDue
                      ? `Next: ${nextDue.className} ${nextDue.name} (${formatShortDay(nextDue.dueDate)})`
                      : 'No upcoming assignments'}
                  </p>
                </div>

                <div className="stat-card">
                  <p className="stat-label">Overdue</p>
                  <p className="stat-value">{overdue.length}</p>
                  <p className="stat-sub">
                    {overdue.length > 0 ? 'Knock these out today' : 'All caught up'}
                  </p>
                </div>

                <div className="stat-card">
                  <p className="stat-label">Friends online</p>
                  <p className="stat-value">—</p>
                  <p className="stat-sub">Coming soon</p>
                </div>
              </div>
            </section>

            <section className="focus-section">
              <h2>Today’s Focus</h2>
              <ul className="focus-list">
                <li>
                  You have {dueThisWeekCount} assignment{dueThisWeekCount !== 1 ? 's' : ''} due this week
                </li>
                <li>
                  {nextDue
                    ? `Next due: ${nextDue.className} ${nextDue.name} – ${formatShortDay(nextDue.dueDate)}`
                    : 'No upcoming assignments'}
                </li>
                <li>
                  {overdue.length} task{overdue.length !== 1 ? 's' : ''} overdue
                </li>
              </ul>
            </section>

            <section className="activity-section">
              <h2>Activity Preview</h2>
              <ul className="activity-list">
                <li>Alex posted a study tip</li>
                <li>Sarah finished CS 224 Lab 3</li>
                <li>3 classmates are studying Algorithms</li>
              </ul>
              <Link to="/feed" className="view-feed-link">View full feed →</Link>
            </section>

            <section className="actions-section">
              <h2>Quick Actions</h2>
              <div className="actions-buttons">
                <Link to="/todo" className="actions-btn-link">Add Assignment</Link>
                <Link to="/feed" className="actions-btn-link">Create Post</Link>
                <Link to="/todo" className="actions-btn-link">View To-Do List</Link>
              </div>
            </section>
          </div>

          <aside className="home-sidebar">
            <section className="sidebar-card">
              <h2>Upcoming</h2>
              {assignments.length === 0 ? (
                <p style={{ color: 'var(--muted)', margin: 0 }}>
                  No assignments. Add some in <Link to="/todo">To Do</Link>.
                </p>
              ) : (
                <ul>
                  {assignments
                    .slice()
                    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                    .slice(0, 5)
                    .map((a) => (
                      <li key={a.id}>
                        <strong>{a.className}</strong> — {a.name} ({formatShortDay(a.dueDate)})
                      </li>
                    ))}
                </ul>
              )}
            </section>

            <section className="sidebar-card">
              <h2>Study Tip</h2>
              <p>Try a 25-minute sprint + 5-minute break. Repeat 2–3 times.</p>
              <p style={{ marginTop: '10px', color: 'var(--faint)', fontSize: '13px' }}>
                (placeholder: 3rd-party API / tips service)
              </p>
            </section>

            <section className="sidebar-card">
              <h2>Quick Links</h2>
              <ul>
                <li><Link to="/todo">Homework Hub</Link></li>
                <li><Link to="/feed">Class Feed</Link></li>
              </ul>
            </section>
          </aside>
        </div>
      </main>
    </>
  );
}
