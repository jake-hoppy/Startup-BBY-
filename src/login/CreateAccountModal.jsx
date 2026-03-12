import React, { useEffect, useMemo, useState } from 'react';

/**
 * Create Account modal for the login page.
 * Props: isOpen, onClose, onSubmit (optional; for now just close on submit)
 */
export function CreateAccountModal({ isOpen, onClose, onSubmit, error = '' }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isOpen) {
      setUsername('');
      setEmail('');
      setPassword('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const trimmedUsername = username.trim();
  const trimmedEmail = email.trim();
  const isValid = useMemo(() => {
    return trimmedUsername.length > 0 && emailRegex.test(trimmedEmail) && password.length > 0;
  }, [trimmedUsername, trimmedEmail, password]);

  const hint = useMemo(() => {
    if (!trimmedUsername) return 'Enter a username.';
    if (!emailRegex.test(trimmedEmail)) return 'Please enter a valid email address.';
    if (!password.length) return 'Password is required.';
    return 'Ready to create account ✅';
  }, [trimmedUsername, trimmedEmail, password]);

  function handleOverlayClick() {
    onClose?.();
  }

  function handleCardClick(e) {
    e.stopPropagation();
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) return;
    onSubmit?.({ username: trimmedUsername, email: trimmedEmail, password });
  }

  if (!isOpen) return null;

  return (
    <div className="sl-modal-overlay" role="presentation" onClick={handleOverlayClick}>
      <div
        className="sl-modal-card"
        role="dialog"
        aria-modal="true"
        aria-label="Create account"
        onClick={handleCardClick}
      >
        <div className="sl-modal-header">
          <h3 className="sl-modal-title">Create account</h3>
          <button className="sl-modal-x" type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <p className="sl-modal-subtitle">
          Enter a username, email, and password. You can then use them to log in.
        </p>

        {error && (
          <p id="create-account-error" className="sl-modal-hint" style={{ color: '#ff8b8b' }} aria-live="polite">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="sl-modal-form">
          <label className="sl-modal-label">
            Username
            <input
              className="sl-modal-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="jane"
              autoFocus
            />
          </label>

          <label className="sl-modal-label">
            Email
            <input
              className="sl-modal-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <label className="sl-modal-label">
            Password
            <input
              className="sl-modal-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a password"
            />
          </label>

          <div className="sl-modal-hint" aria-live="polite">
            {hint}
          </div>

          <div className="sl-modal-actions">
            <button type="button" className="sl-btn sl-btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="sl-btn sl-btn-primary" disabled={!isValid}>
              Create account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
