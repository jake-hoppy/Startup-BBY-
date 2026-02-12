import React from 'react';
import { Link } from 'react-router-dom';


export function Home() {
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
              <Link to="/feed" aria-current="page">
                Feed
              </Link>
            </li>
            <li>
              <Link to="/todo">To Do</Link>
            </li>
          </ul>

          <button onClick={() => (window.location.href = 'index.html')}>Logout</button>
        </nav>
      </header>

      <main>
        <div className="home-layout">
          <div className="home-main">
            <section className="welcome-section">
              <h2>Welcome back, Jake</h2>
              <p className="welcome-subtitle">
                Learn together. Stay organized. Share progress.
              </p>

              <div className="stats-grid">
                <div className="stat-card">
                  <p className="stat-label">Due soon</p>
                  <p className="stat-value">3</p>
                  <p className="stat-sub">Next: CS 260 Project (Fri)</p>
                </div>

                <div className="stat-card">
                  <p className="stat-label">Overdue</p>
                  <p className="stat-value">2</p>
                  <p className="stat-sub">Knock these out today</p>
                </div>

                <div className="stat-card">
                  <p className="stat-label">Friends online</p>
                  <p className="stat-value">3</p>
                  <p className="stat-sub">1 new post</p>
                </div>
              </div>
            </section>

            <section className="focus-section">
              <h2>Today’s Focus</h2>
              <ul className="focus-list">
                <li>You have 3 assignments due this week</li>
                <li>Next due: CS 260 Project – Friday</li>
                <li>2 tasks overdue</li>
              </ul>
            </section>

            <section className="activity-section">
              <h2>Activity Preview</h2>
              <ul className="activity-list">
                <li>Alex posted a study tip</li>
                <li>Sarah finished CS 224 Lab 3</li>
                <li>3 classmates are studying Algorithms</li>
              </ul>
              <a href="feed.html" className="view-feed-link">View full feed →</a>
            </section>

            <section className="actions-section">
              <h2>Quick Actions</h2>
              <div className="actions-buttons">
                <button onClick={() => (window.location.href = 'toDo.html')}>Add Assignment</button>
                <button onClick={() => (window.location.href = 'feed.html')}>Create Post</button>
                <button onClick={() => (window.location.href = 'toDo.html')}>View To-Do List</button>
              </div>
            </section>
          </div>

          <aside className="home-sidebar">
            <section className="sidebar-card">
              <h2>Upcoming</h2>
              <ul>
                <li><strong>CS 260</strong> — Project checkpoint (Fri)</li>
                <li><strong>Canvas</strong> — Quiz due (Sun)</li>
                <li><strong>Learning Suite</strong> — Reading (Mon)</li>
              </ul>
              <p style={{ marginTop: '10px', color: 'var(--faint)', fontSize: '13px' }}>
                (placeholder: populated from Canvas / Learning Suite)
              </p>
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
                <li><a href="toDo.html">Homework Hub</a></li>
                <li><a href="feed.html">Class Feed</a></li>
              </ul>
            </section>
          </aside>
        </div>
      </main>
    </>
  );
}
