import React, { useEffect, useMemo, useState } from "react";

/**
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - onSubmit: ({ name, dueDate, className }) => void
 * - classes: string[]  (ex: ["CS 260", "CS 224", "Algorithms"])
 */
export function AddAssignmentModal({ isOpen, onClose, onSubmit, classes = [] }) {
  const [name, setName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [className, setClassName] = useState("");

  // Reset fields whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setName("");
      setDueDate("");
      setClassName("");
    }
  }, [isOpen]);

  // Escape key closes modal
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const isValid = useMemo(() => {
    return name.trim().length > 0 && dueDate.trim().length > 0 && className.trim().length > 0;
  }, [name, dueDate, className]);

  const hint = useMemo(() => {
    if (!name.trim() && !dueDate && !className) return "Fill out the fields to add an assignment.";
    if (!name.trim()) return "Assignment name is required.";
    if (!dueDate) return "Due date is required.";
    if (!className) return "Please choose a class.";
    return "Ready to add ✅";
  }, [name, dueDate, className]);

  function handleOverlayClick() {
    onClose?.();
  }

  function handleCardClick(e) {
    e.stopPropagation();
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) return;

    onSubmit?.({
      name: name.trim(),
      dueDate: dueDate.trim(),     // "YYYY-MM-DD" from <input type="date">
      className: className.trim(),
    });

    onClose?.();
  }

  if (!isOpen) return null;

  return (
    <div className="sl-modal-overlay" role="presentation" onClick={handleOverlayClick}>
      <div
        className="sl-modal-card"
        role="dialog"
        aria-modal="true"
        aria-label="Add assignment"
        onClick={handleCardClick}
      >
        <div className="sl-modal-header">
          <h3 className="sl-modal-title">Add Assignment</h3>
          <button className="sl-modal-x" type="button" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <p className="sl-modal-subtitle">Add an assignment to your to-do list.</p>

        <form onSubmit={handleSubmit} className="sl-modal-form">
          <label className="sl-modal-label">
            Assignment name
            <input
              className="sl-modal-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="assignment name (ex: Homework 3)"
              autoFocus
            />
          </label>

          <label className="sl-modal-label">
            Due date
            <input
              className="sl-modal-input"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </label>

          <label className="sl-modal-label">
            Class
            <select
              className="sl-modal-input"
              value={className}
              onChange={(e) => setClassName(e.target.value)}
            >
              <option value="" disabled>
                Select a class…
              </option>
              {classes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <div className="sl-modal-hint" aria-live="polite">
            {hint}
          </div>

          <div className="sl-modal-actions">
            <button type="button" className="sl-btn sl-btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="sl-btn sl-btn-primary" disabled={!isValid}>
              Add
            </button>
          </div>
        </form>

        <div className="sl-modal-footer">
          <small>Tip: you can sort “Upcoming Assignments” by due date later.</small>
        </div>
      </div>
    </div>
  );
}