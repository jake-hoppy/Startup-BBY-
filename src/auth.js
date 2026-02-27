/**
 * Per-user auth and data in localStorage (no backend).
 * Keys: sociallearning_users, sociallearning_currentUser,
 *       sociallearning_classes_<email>, sociallearning_assignments_<email>
 */

const PREFIX = 'sociallearning_';

export function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(PREFIX + 'users') || '[]');
  } catch {
    return [];
  }
}

export function saveUsers(users) {
  localStorage.setItem(PREFIX + 'users', JSON.stringify(users));
}

export function getCurrentUser() {
  return localStorage.getItem(PREFIX + 'currentUser');
}

export function setCurrentUser(email) {
  if (email == null) localStorage.removeItem(PREFIX + 'currentUser');
  else localStorage.setItem(PREFIX + 'currentUser', email);
}

export function userExists(email) {
  return getUsers().some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

export function addUser(email, password) {
  const users = getUsers();
  users.push({ email: email.trim(), password });
  saveUsers(users);
  setCurrentUser(email.trim());
}

export function validateLogin(email, password) {
  const users = getUsers();
  const u = users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
  );
  return u ? u.email : null;
}

function userKey(email, suffix) {
  const user = email || getCurrentUser();
  return user ? PREFIX + suffix + '_' + user : null;
}

export function getClasses(email) {
  const key = userKey(email, 'classes');
  if (!key) return [];
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

export function saveClasses(email, classes) {
  const key = userKey(email, 'classes');
  if (key) localStorage.setItem(key, JSON.stringify(classes));
}

export function getAssignments(email) {
  const key = userKey(email, 'assignments');
  if (!key) return [];
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

export function saveAssignments(email, assignments) {
  const key = userKey(email, 'assignments');
  if (key) localStorage.setItem(key, JSON.stringify(assignments));
}
