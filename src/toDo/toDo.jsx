import React from 'react';
import { Link } from 'react-router-dom';

export function ToDo() {
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

          <Link to="/login">
            <button>Logout</button>
          </Link>
        </nav>
      </header>

      <main>
        <div className="todo-layout">
          <section className="todo-main">
            <h1>To Do</h1>

            <section className="todo-filters">
              <h2>Class Filter</h2>
              <div className="filter-buttons">
                <button>All</button>
                <button>CS 260</button>
                <button>CS 224</button>
                <button>Algorithms</button>
              </div>
            </section>

            <section className="calendar-section">
              <h2>Calendar</h2>

              <div className="calendar-card">
                <div className="calendar-header">
                  <button aria-label="Previous month">‹</button>
                  <h3>January 2026</h3>
                  <button aria-label="Next month">›</button>
                </div>

                <div className="calendar-grid">
                  {[
                    'Sun','Mon','Tue','Wed','Thu','Fri','Sat',
                    '', '', '', '', '', '1', '2',
                    '3','4','5','6','7','8','9',
                    '10','11','12','13','14','15','16',
                    '17','18','19','20','21','22','23',
                    '24','25','26','27','28','29','30',
                    '31','','','','','',''
                  ].map((day, i) => (
                    <div
                      key={i}
                      className={`calendar-day ${
                        day === '' ? 'calendar-day-empty' : ''
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                <div className="calendar-legend">
                  <p>
                    <strong>Legend:</strong> 📝 Assignment · 🧪 Test
                  </p>
                </div>
              </div>
            </section>
          </section>

          <aside className="todo-sidebar">
            <section className="sidebar-card db-placeholder">
              <h2>Assignments loaded from database</h2>
              <div id="db-assignments">Loading assignments…</div>
            </section>

            <section className="sidebar-card">
              <h2>Upcoming Assignments</h2>
              <ul className="upcoming-list">
                <li><strong>CS 260:</strong> Project Checkpoint – Friday</li>
                <li><strong>CS 224:</strong> Lab 3 – Friday</li>
                <li><strong>Algorithms:</strong> Problem Set 2 – Monday</li>
              </ul>
            </section>

            <section className="sidebar-card">
              <h2>Upcoming Tests</h2>
              <ul className="upcoming-list">
                <li><strong>CS 224:</strong> Quiz 1 – Thursday</li>
                <li><strong>Algorithms:</strong> Midterm Review – Next week</li>
              </ul>
            </section>
          </aside>
        </div>
      </main>
    </>
  );
}
