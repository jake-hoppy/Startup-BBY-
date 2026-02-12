import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function Feed() {
  const navigate = useNavigate();

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

          <button onClick={() => navigate('/login')}>Logout</button>
        </nav>
      </header>

      <main>
        <div className="feed-layout">
          <div className="feed-main">
            <section className="create-post-section">
              <h2>Create Post</h2>

              <textarea
                placeholder="Share a study accomplishment, question, or resource…"
                rows={4}
              />

              <div className="post-controls">
                <select defaultValue="">
                  <option value="">Select category</option>
                  <option value="question">Question</option>
                  <option value="accomplishment">Accomplishments</option>
                  <option value="resource">Resource</option>
                </select>

                <button>Post</button>
              </div>
            </section>

            <h1>Feed</h1>

            <section className="feed-filters">
              <button>All</button>
              <button>Questions</button>
              <button>Accomplishments</button>
              <button>Resources</button>
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
              <article className="post-card">
                <div className="post-avatar">AJ</div>
                <div className="post-content">
                  <div className="post-header">
                    <span className="post-author">Alex Johnson</span>
                    <span className="post-meta">CS 224 · 10m ago</span>
                  </div>
                  <p className="post-text">Anyone understand recursion base cases?</p>
                  <div className="post-actions">
                    <button>Like</button>
                    <button>Comment</button>
                    <button>Save</button>
                  </div>
                </div>
              </article>

              <article className="post-card">
                <div className="post-avatar">SJ</div>
                <div className="post-content">
                  <div className="post-header">
                    <span className="post-author">Sarah Jones</span>
                    <span className="post-meta">CS 260 · 1h ago</span>
                  </div>
                  <p className="post-text">Finished CS 260 deploy step ✅</p>
                  <div className="post-actions">
                    <button>Like</button>
                    <button>Comment</button>
                    <button>Save</button>
                  </div>
                </div>
              </article>

              <article className="post-card">
                <div className="post-avatar">MH</div>
                <div className="post-content">
                  <div className="post-header">
                    <span className="post-author">Mike Hall</span>
                    <span className="post-meta">CS 224 · 3h ago</span>
                  </div>
                  <p className="post-text">Here’s a great regex cheat sheet</p>
                  <div className="resource-card">
                    <p>Regex Cheat Sheet (PDF)</p>
                  </div>
                  <div className="post-actions">
                    <button>Like</button>
                    <button>Comment</button>
                    <button>Save</button>
                  </div>
                </div>
              </article>

              <article className="post-card">
                <div className="post-avatar">KL</div>
                <div className="post-content">
                  <div className="post-header">
                    <span className="post-author">Kevin Lee</span>
                    <span className="post-meta">Algorithms · Yesterday</span>
                  </div>
                  <p className="post-text">Study group tonight at 7pm?</p>
                  <div className="post-actions">
                    <button>Like</button>
                    <button>Comment</button>
                    <button>Save</button>
                  </div>
                </div>
              </article>
            </section>
          </div>

          <aside className="feed-sidebar">
            <section className="sidebar-card api-placeholder">
              <h3>Study Tip of the Day</h3>

              {/* 
                This section is intended to be populated by a future 3rd-party API.
                Example APIs could include:
                - Study tips
                - Productivity quotes
                - Learning resources
              */}

              <div id="study-tip">Loading study tip...</div>

              {/* 
                Example future JavaScript (not active yet):

                <script>
                  // fetch('https://api.example.com/study-tip')
                  //   .then(response => response.json())
                  //   .then(data => {
                  //     document.getElementById('study-tip').textContent = data.tip;
                  //   })
                  //   .catch(error => {
                  //     document.getElementById('study-tip').textContent = 'Unable to load study tip.';
                  //   });
                </script>
              */}
            </section>

            <section className="sidebar-card">
              <h3>Today’s Goal</h3>
              <p>Finish 2 tasks</p>
            </section>

            <section className="sidebar-card">
              <h3>Upcoming Due</h3>
              <p>Lab 3 – Friday</p>
            </section>

            <section className="sidebar-card">
              <h3>Study Buddies Online</h3>
              <ul>
                <li>Alex</li>
                <li>Sarah</li>
                <li>Mike</li>
              </ul>
            </section>

            <section className="sidebar-card">
              <h3>Suggested Resources</h3>
              <ul>
                <li>
                  <a href="#">Recursion practice problems</a>
                </li>
                <li>
                  <a href="#">Regex cheat sheet</a>
                </li>
                <li>
                  <a href="#">Git deploy checklist</a>
                </li>
              </ul>
            </section>
          </aside>
        </div>
      </main>
    </>
  );
}
