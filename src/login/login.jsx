import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreateAccountModal } from './CreateAccountModal';
import { useAuth } from '../contexts/AuthContext';
import './login.css';

export function Login() {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [createAccountError, setCreateAccountError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    try {
      await login(email, password);
      navigate('/home');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password');
    }
  }

  async function handleCreateAccount({ username, email: newEmail, password: newPassword }) {
    setCreateAccountError('');
    try {
      await signup(username, newEmail, newPassword);
      setShowCreateAccount(false);
      navigate('/home');
    } catch (err) {
      setCreateAccountError(err.message === 'Existing user' ? 'Email already registered' : err.message);
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
            <span>Don't have an account?</span>
            <button type="button" className="auth-meta-link" onClick={() => setShowCreateAccount(true)}>
              Create one
            </button>
          </div>
        </section>
      </main>

      <CreateAccountModal
        isOpen={showCreateAccount}
        onClose={() => { setShowCreateAccount(false); setCreateAccountError(''); }}
        onSubmit={handleCreateAccount}
        error={createAccountError}
      />
    </div>
  );
}
