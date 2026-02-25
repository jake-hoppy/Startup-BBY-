import React, { useEffect, useMemo, useState } from "react";

/**
 * AddClassModal
 * - Controlled by: isOpen (boolean)
 * - Close via: onClose()
 * - Submit via: onSubmit({ url, label })
 *
 * No backend logic here—just UI + basic validation.
 */
export function AddClassModal({ isOpen, onClose, onSubmit }) {
  const [url, setUrl] = useState("");
  const [label, setLabel] = useState("");

  // Reset fields whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      setUrl("");
      setLabel("");
    }
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const trimmedUrl = url.trim();

  const urlHint = useMemo(() => {
    if (!trimmedUrl) return null;
    const lower = trimmedUrl.toLowerCase();
    if (lower.startsWith("webcal://")) {
      return "Tip: webcal:// links usually work if converted to https://";
    }
    if (lower.includes(".ics")) {
      return "Looks like an .ics link ✅";
    }
    if (lower.startsWith("http://") || lower.startsWith("https://")) {
      return "This is a URL, but it doesn’t look like an .ics link.";
    }
    return "That doesn’t look like a valid URL yet.";
  }, [trimmedUrl]);

  const isValid = useMemo(() => {
    if (!trimmedUrl) return false;

    const lower = trimmedUrl.toLowerCase();
    const looksLikeWebcal = lower.startsWith("webcal://");
    const looksLikeHttp = lower.startsWith("http://") || lower.startsWith("https://");

    // Minimal heuristic: allow webcal OR http(s) with .ics somewhere
    if (looksLikeWebcal) return true;
    if (looksLikeHttp && lower.includes(".ics")) return true;

    return false;
  }, [trimmedUrl]);

  if (!isOpen) return null;

  function handleOverlayClick() {
    onClose?.();
  }

  function handleCardClick(e) {
    e.stopPropagation();
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) return;

    const cleaned =
      trimmedUrl.toLowerCase().startsWith("webcal://")
        ? "https://" + trimmedUrl.slice("webcal://".length)
        : trimmedUrl;

    onSubmit?.({
      url: cleaned,
      label: label.trim() || null,
    });

    onClose?.();
  }

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
        aria-label="Add class"
        onClick={handleCardClick}
      >
        <div className="sl-modal-header">
          <h3 className="sl-modal-title">Add Class</h3>
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
          Paste an iCalendar (.ics) link from Learning Suite / Canvas / Google Calendar.
        </p>

        <form onSubmit={handleSubmit} className="sl-modal-form">
          <label className="sl-modal-label">
            iCal / ICS link
            <input
              className="sl-modal-input"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://.../calendar.ics  or  webcal://..."
              autoFocus
            />
          </label>

          <div className="sl-modal-hint" aria-live="polite">
            {urlHint}
          </div>

          <label className="sl-modal-label">
            Class label (optional)
            <input
              className="sl-modal-input"
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="CS 260"
            />
          </label>

          <div className="sl-modal-actions">
            <button type="button" className="sl-btn sl-btn-ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="sl-btn sl-btn-primary" disabled={!isValid}>
              Import
            </button>
          </div>
        </form>

        <div className="sl-modal-footer">
          <small>
            If the link is private, you may need a public/share iCal link or an exported .ics file.
          </small>
        </div>
      </div>
    </div>
  );
}