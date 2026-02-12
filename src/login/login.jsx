import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  function handleSubmit(e) {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    // VERY simple fake login (same as your HTML)
    if (email === 'student@example.com' && password === 'password') {
      localStorage.setItem('loggedIn', 'true');
      navigate('/'); // home route
    } else {
      setErrorMsg('Invalid username or password');
    }
  }

  return (
    <div className="auth-page">
      <main className="auth-main">
        <nav className="auth-nav">
          <ul>
            <li>
              <Link to="/home">Home</Link>
            </li>
            <li>
              <Link to="/feed">Feed</Link>
            </li>
            <li>
              <Link to="/todo">ToDo</Link>
            </li>
          </ul>
        </nav>

        <section className="auth-card">
          <header>
            <div className="header-brand">
              <div className="logo-placeholder">
                <img src="SociallearningLogo.png" alt="Sociallearning logo" />
              </div>
              <h1 className="site-title">Sociallearning</h1>
            </div>

            <p className="auth-subtitle">Please sign in to continue</p>
          </header>

          <section className="auth-form">
            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="username">Email</label>
                <input
                  id="username"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button type="submit">Log In</button>
            </form>

            <p id="error" className="auth-subtitle" aria-live="polite">
              {errorMsg}
            </p>
          </section>

          <div className="auth-meta">
            <span>Don’t have an account?</span>
            <Link to="#">Create one</Link>
          </div>
        </section>
      </main>
    </div>
  );
}
