import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

export function ToDo() {
  // --- Calendar state + helpers ---
  const MONTH_NAMES = useMemo(
    () => [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    []
  );

  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-11

  function goPrevMonth() {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }

  function goNextMonth() {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }

  const calendarCells = useMemo(() => {
    // First day-of-week (0=Sun..6=Sat) for the 1st of the month
    const firstDow = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells = [];

    // Weekday header row
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach((d) =>
      cells.push({ type: 'header', label: d, inMonth: true })
    );

    // Leading days from previous month (soft)
    for (let i = firstDow; i > 0; i--) {
      const dayNum = daysInPrevMonth - i + 1;
      cells.push({ type: 'day', label: String(dayNum), inMonth: false });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ type: 'day', label: String(d), inMonth: true });
    }

    // Trailing days from next month (soft) to complete the last week
    let nextDay = 1;
    while ((cells.length - 7) % 7 !== 0) {
      cells.push({ type: 'day', label: String(nextDay), inMonth: false });
      nextDay++;
    }

    return cells;
  }, [viewYear, viewMonth]);
  // --- End calendar state + helpers ---

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
                  <button onClick={goPrevMonth} aria-label="Previous month" type="button">
                    ‹
                  </button>
                  <h3>
                    {MONTH_NAMES[viewMonth]} {viewYear}
                  </h3>
                  <button onClick={goNextMonth} aria-label="Next month" type="button">
                    ›
                  </button>
                </div>

                <div className="calendar-grid">
                  {calendarCells.map((cell, i) => (
                    <div
                      key={i}
                      className={`calendar-day ${
                        cell.type === 'header' ? 'calendar-day-header' : ''
                      } ${
                        cell.type === 'day' && !cell.inMonth
                          ? 'calendar-day-outside'
                          : ''
                      }`}
                      style={
                        cell.type === 'day' && !cell.inMonth
                          ? { opacity: 0.45 }
                          : undefined
                      }
                    >
                      {cell.label}
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
