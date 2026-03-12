/**
 * Per-user auth and data in memory only (no persistence).
 * Data is lost on page reload.
 */

let users = [];
let currentUser = null;
const userData = Object.create(null); // email -> { classes, assignments, posts }

export function getUsers() {
  return users;
}

export function saveUsers(newUsers) {
  users = newUsers;
}

export function getCurrentUser() {
  return currentUser;
}

export function setCurrentUser(email) {
  currentUser = email == null ? null : email;
}

export function userExists(email) {
  return users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase());
}

export function addUser(email, password) {
  users = [...users, { email: email.trim(), password }];
  setCurrentUser(email.trim());
}

export function validateLogin(email, password) {
  const u = users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
  );
  return u ? u.email : null;
}

function getUserData(email, key) {
  const user = email || currentUser;
  if (!user) return [];
  if (!userData[user]) userData[user] = { classes: [], assignments: [], posts: [] };
  return userData[user][key] || [];
}

function setUserData(email, key, value) {
  const user = email || currentUser;
  if (!user) return;
  if (!userData[user]) userData[user] = { classes: [], assignments: [], posts: [] };
  userData[user][key] = value;
}

export function getClasses(email) {
  return getUserData(email, 'classes');
}

export function saveClasses(email, classes) {
  setUserData(email, 'classes', classes);
}

export function getAssignments(email) {
  return getUserData(email, 'assignments');
}

export function saveAssignments(email, assignments) {
  setUserData(email, 'assignments', assignments);
}

export function getPosts(email) {
  return getUserData(email, 'posts');
}

export function savePosts(email, posts) {
  setUserData(email, 'posts', posts);
}
