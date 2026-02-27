import React, { useEffect, useState } from "react";

/**
 * MakeClassModal — add a single class by name (not from Learning Suite).
 * Used by the "Make Class" button. Submits onSubmit({ className }).
 */
export function MakeClassModal({ isOpen, onClose, onSubmit }) {
  const [className, setClassName] = useState("");

  useEffect(() => {
    if (isOpen) {
      setClassName("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const trimmed = className.trim();
  const isValid = trimmed.length > 0;

  function handleOverlayClick() {
    onClose?.();
  }

  function handleCardClick(e) {
    e.stopPropagation();
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) return;
    onSubmit?.({ className: trimmed });
    onClose?.();
  }

  if (!isOpen) return null;

  return (
    <div
      className="sl-modal-overlay"
      role="presentation"
      onClick={handleOverlayClick}
    >
      <div
        className="sl-modal-card"
        role="dialog"
        aria-modal="true"
        aria-label="Make class"
        onClick={handleCardClick}
      >
        <div className="sl-modal-header">
          <h3 className="sl-modal-title">Make Class</h3>
          <button
            className="sl-modal-x"
            type="button"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <p className="sl-modal-subtitle">
          Add a class by name. It will show in the class filter and when you add assignments.
        </p>

        <form onSubmit={handleSubmit} className="sl-modal-form">
          <label className="sl-modal-label">
            Class name
            <input
              className="sl-modal-input"
              type="text"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="e.g. CS 260"
              autoFocus
            />
          </label>

          <div className="sl-modal-actions">
            <button type="button" className="sl-btn sl-btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="sl-btn sl-btn-primary" disabled={!isValid}>
              Add Class
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
