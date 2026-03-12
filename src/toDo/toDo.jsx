import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AddClassModal } from './AddClassModal';
import { MakeClassModal } from './MakeClassModal';
import { AddAssignmentModal } from './AddAssignmentModal';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api';
import './toDo.css';

export function ToDo() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const currentUser = user?.email;

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

  // Modals
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [isMakeClassOpen, setIsMakeClassOpen] = useState(false);
  const [isAddAssignmentOpen, setIsAddAssignmentOpen] = useState(false);

  // Classes and assignments from backend
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const fetchClasses = useCallback(async () => {
    const res = await api('/api/classes');
    if (res.ok) setClasses(await res.json());
  }, []);

  const fetchAssignments = useCallback(async () => {
    const res = await api('/api/assignments');
    if (res.ok) setAssignments(await res.json());
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchClasses();
      fetchAssignments();
    }
  }, [currentUser, fetchClasses, fetchAssignments]);

  // Filter state (All or a specific class)
  const [selectedClass, setSelectedClass] = useState('All');

  // Tasks from backend API
  const [apiTasks, setApiTasks] = useState([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [tasksLoading, setTasksLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    setTasksLoading(true);
    try {
      const res = await api('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setApiTasks(Array.isArray(data) ? data : []);
      }
    } catch {
      setApiTasks([]);
    } finally {
      setTasksLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser) fetchTasks();
  }, [currentUser, fetchTasks]);

  async function handleAddTask(e) {
    e.preventDefault();
    const title = taskTitle.trim();
    if (!title) return;
    try {
      const res = await api('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        const task = await res.json();
        setApiTasks((prev) => [task, ...prev]);
        setTaskTitle('');
      }
    } catch {
      // ignore
    }
  }

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  // Build calendar cells with a dateKey (YYYY-MM-DD) for each day cell
  const calendarCells = useMemo(() => {
    const firstDow = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

    const cells = [];

    // Weekday header row
    ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].forEach((d) =>
      cells.push({ type: 'header', label: d, inMonth: true })
    );

    // Leading days from previous month
    for (let i = firstDow; i > 0; i--) {
      const dayNum = daysInPrevMonth - i + 1;
      const dateObj = new Date(viewYear, viewMonth - 1, dayNum);
      cells.push({
        type: 'day',
        label: String(dayNum),
        inMonth: false,
        dateKey: dateObj.toISOString().slice(0, 10),
      });
    }

    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(viewYear, viewMonth, d);
      cells.push({
        type: 'day',
        label: String(d),
        inMonth: true,
        dateKey: dateObj.toISOString().slice(0, 10),
      });
    }

    // Trailing days from next month
    let nextDay = 1;
    while ((cells.length - 7) % 7 !== 0) {
      const dateObj = new Date(viewYear, viewMonth + 1, nextDay);
      cells.push({
        type: 'day',
        label: String(nextDay),
        inMonth: false,
        dateKey: dateObj.toISOString().slice(0, 10),
      });
      nextDay++;
    }

    return cells;
  }, [viewYear, viewMonth]);

  // Map assignments by dueDate for fast calendar lookup
  const assignmentsByDate = useMemo(() => {
    const map = new Map();
    for (const a of assignments) {
      const key = a.dueDate; // "YYYY-MM-DD"
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(a);
    }
    return map;
  }, [assignments]);

  // Filtered assignments list (for Upcoming Assignments)
  const filteredAssignments = useMemo(() => {
    return assignments.filter(
      (a) => selectedClass === 'All' || a.className === selectedClass
    );
  }, [assignments, selectedClass]);

  // Sorted version for rendering
  const filteredAssignmentsSorted = useMemo(() => {
    return filteredAssignments
      .slice()
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [filteredAssignments]);

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
        <div className="todo-layout">
          <section className="todo-main">
            <h1>To Do</h1>

            <section className="todo-filters">
              <h2>Class Filter</h2>
              <div className="filter-buttons">
                <button
                  type="button"
                  onClick={() => setSelectedClass('All')}
                  aria-pressed={selectedClass === 'All'}
                >
                  All
                </button>

                {classes.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedClass(c)}
                    aria-pressed={selectedClass === c}
                  >
                    {c}
                  </button>
                ))}
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
                  {calendarCells.map((cell, i) => {
                    const dayAssignments =
                      cell.type === 'day' && cell.dateKey
                        ? assignmentsByDate.get(cell.dateKey) || []
                        : [];

                    const visibleDayAssignments = dayAssignments.filter(
                      (a) => selectedClass === 'All' || a.className === selectedClass
                    );

                    return (
                      <div
                        key={i}
                        className={`calendar-day ${
                          cell.type === 'header' ? 'calendar-day-label' : ''
                        } ${
                          cell.type === 'day' && !cell.inMonth ? 'calendar-day-outside' : ''
                        }`}
                        style={
                          cell.type === 'day' && !cell.inMonth ? { opacity: 0.45 } : undefined
                        }
                      >
                        {cell.label}

                        {/* Assignment markers */}
                        {cell.type === 'day' && visibleDayAssignments.length > 0 && (
                          <div className="calendar-badges">
                            {visibleDayAssignments.slice(0, 2).map((a) => (
                              <span
                                key={a.id}
                                className="calendar-badge"
                                title={`${a.className}: ${a.name}`}
                              >
                                📝
                              </span>
                            ))}

                            {visibleDayAssignments.length > 2 && (
                              <span className="calendar-badge-more">
                                +{visibleDayAssignments.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
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
            <section className="sidebar-card">
              <h2>My Tasks</h2>
              <p>Tasks from backend</p>
              <form onSubmit={handleAddTask} className="todo-add-task-form">
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="New task..."
                  className="todo-task-input"
                />
                <button type="submit" className="add-class-button">Add Task</button>
              </form>
              {tasksLoading ? (
                <p className="todo-tasks-loading">Loading…</p>
              ) : (
                <ul className="upcoming-list">
                  {apiTasks.map((t) => (
                    <li key={t.id}>
                      <span className={t.completed ? 'todo-task-done' : ''}>{t.title}</span>
                    </li>
                  ))}
                  {apiTasks.length === 0 && (
                    <li style={{ opacity: 0.7 }}>No tasks yet.</li>
                  )}
                </ul>
              )}
            </section>

            <section className="sidebar-card">
              <h2>Add Class</h2>
              <p>Add a class from your Learning Suite link</p>

              <button
                className="add-class-button"
                type="button"
                onClick={() => setIsAddClassOpen(true)}
              >
                Add Class
              </button>
            </section>

            <section className="sidebar-card">
              <h2>Make Class</h2>
              <p>Create a new class (not from Learning Suite)</p>

              <button
                className="make-class-button"
                type="button"
                onClick={() => setIsMakeClassOpen(true)}
              >
                Make Class
              </button>
            </section>

            <section className="sidebar-card">
              <h2>Assignments</h2>
              <p>Add an assignment to your to-do list</p>

              <button
                className="add-assignment-button"
                type="button"
                onClick={() => setIsAddAssignmentOpen(true)}
              >
                Add Assignment
              </button>
            </section>

            <section className="sidebar-card">
              <h2>Upcoming Assignments</h2>

              <ul className="upcoming-list">
                {filteredAssignmentsSorted.map((a) => (
                  <li key={a.id}>
                    <strong>{a.className}:</strong> {a.name} – {a.dueDate}
                  </li>
                ))}

                {filteredAssignmentsSorted.length === 0 && (
                  <li style={{ opacity: 0.7 }}>
                    No assignments{selectedClass === 'All' ? '' : ` for ${selectedClass}`} yet.
                  </li>
                )}
              </ul>
            </section>
          </aside>
        </div>
      </main>

      {/* Add Class Modal (Learning Suite / iCal) */}
      <AddClassModal
        isOpen={isAddClassOpen}
        onClose={() => setIsAddClassOpen(false)}
        onSubmit={async ({ url, label }) => {
          const name = (label || '').trim();
          if (!name) return;
          const res = await api('/api/classes', {
            method: 'POST',
            body: JSON.stringify({ name }),
          });
          if (res.ok) setClasses(await res.json());
        }}
      />

      {/* Make Class Modal (single class by name) */}
      <MakeClassModal
        isOpen={isMakeClassOpen}
        onClose={() => setIsMakeClassOpen(false)}
        onSubmit={async ({ className: newClassName }) => {
          const name = (newClassName || '').trim();
          if (!name) return;
          const res = await api('/api/classes', {
            method: 'POST',
            body: JSON.stringify({ name }),
          });
          if (res.ok) setClasses(await res.json());
        }}
      />

      {/* Add Assignment Modal */}
      <AddAssignmentModal
        isOpen={isAddAssignmentOpen}
        onClose={() => setIsAddAssignmentOpen(false)}
        classes={classes}
        onSubmit={async ({ name, dueDate, className }) => {
          const res = await api('/api/assignments', {
            method: 'POST',
            body: JSON.stringify({ name, dueDate, className: className || '' }),
          });
          if (res.ok) {
            const created = await res.json();
            setAssignments((prev) => [...prev, created]);
          }
        }}
      />
    </>
  );
}