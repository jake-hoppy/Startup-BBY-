/**
 * Frontend API helper. Sends credentials (auth cookie) with every request.
 * No auth logic or user storage here — that stays on the backend.
 */
export function api(path, options = {}) {
  return fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
}
