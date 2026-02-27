import React, { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { setCurrentUser, getCurrentUser, getAssignments, getPosts, savePosts } from '../auth';
import './feed.css';

export function Feed() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [postText, setPostText] = useState('');
  const [postCategory, setPostCategory] = useState('');
  const [posts, setPosts] = useState(() => (currentUser ? getPosts(currentUser) : []));

  useEffect(() => {
    if (currentUser) setPosts(getPosts(currentUser));
  }, [currentUser]);

  const upcomingDue = useMemo(() => {
    if (!currentUser) return [];
    const list = getAssignments(currentUser);
    return list
      .slice()
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 5);
  }, [currentUser]);

  function handleLogout() {
    setCurrentUser(null);
    navigate('/login');
  }

  function handleCreatePost(e) {
    e.preventDefault();
    const trimmed = postText.trim();
    if (!trimmed || !currentUser) return;
    const newPost = {
      id: crypto.randomUUID?.() ?? String(Date.now()),
      author: currentUser,
      text: trimmed,
      category: postCategory || 'post',
      createdAt: new Date().toISOString(),
    };
    const next = [newPost, ...posts];
    setPosts(next);
    savePosts(currentUser, next);
    setPostText('');
    setPostCategory('');
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
              {posts.length === 0 ? (
                <p className="feed-no-posts">No posts yet. Create one above.</p>
              ) : (
                posts.map((post) => (
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
                      <div className="post-actions">
                        <button type="button">Like</button>
                        <button type="button">Comment</button>
                        <button type="button">Save</button>
                      </div>
                    </div>
                  </article>
                ))
              )}
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
