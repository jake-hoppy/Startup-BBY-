const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');

const app = express();
const port = process.argv.length > 2 ? process.argv[2] : 4000;
const authCookieName = 'token';

// Temporary in-memory storage (no database). Data is lost when the service restarts.
const users = [];
const tasks = [];
const classes = [];       // { owner, name }
const assignments = [];   // { id, owner, name, dueDate, className }
const posts = [];         // { id, owner, text, category, createdAt }

app.use(express.json());
app.use(cookieParser());

// In production, frontend is served by Express from public/ (deploy puts Vite build there)
app.use(express.static('public'));

const apiRouter = express.Router();
app.use('/api', apiRouter);

// ---- Auth ----

apiRouter.post('/auth/create', async (req, res) => {
  const { username, email, password } = req.body || {};
  if (!username || !email || !password) {
    res.status(400).send({ msg: 'Username, email, and password required' });
    return;
  }
  if (findUserByEmail(email)) {
    res.status(409).send({ msg: 'Existing user' });
    return;
  }
  const user = await createUser(username.trim(), email.trim(), password);
  setAuthCookie(res, user.token); // set auth cookie with the token
  res.send({ username: user.username, email: user.email });
});

apiRouter.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  const user = findUserByEmail(email); // find the user by email
  // compare password with bcrypt (plain text vs stored hash)
  if (!user || !(await bcrypt.compare(password || '', user.password))) {
    res.status(401).send({ msg: 'Unauthorized' });
    return;
  }
  user.token = uuid.v4(); // create a token if correct
  setAuthCookie(res, user.token);
  res.send({ username: user.username, email: user.email });
});

apiRouter.delete('/auth/logout', (req, res) => {
  const user = findUserByToken(req.cookies[authCookieName]);
  if (user) delete user.token; // remove the stored token
  res.clearCookie(authCookieName); // clear the cookie
  res.status(204).end();
});

apiRouter.get('/user/me', (req, res) => {
  const user = findUserByToken(req.cookies[authCookieName]);
  if (!user) {
    res.status(401).send({ msg: 'Unauthorized' });
    return;
  }
  res.send({ username: user.username, email: user.email });
});

// ---- Auth middleware (restricted endpoints) ----

// Read auth cookie, verify user/token exists, reject if not logged in
function verifyAuth(req, res, next) {
  const user = findUserByToken(req.cookies[authCookieName]);
  if (!user) {
    res.status(401).send({ msg: 'Unauthorized' });
    return;
  }
  req.user = user;
  next();
}

// ---- Tasks (app endpoints) ----

apiRouter.get('/tasks', verifyAuth, (req, res) => {
  const list = tasks.filter((t) => t.owner === req.user.email);
  res.send(list);
});

apiRouter.post('/tasks', verifyAuth, (req, res) => {
  const { title } = req.body || {};
  const task = {
    id: uuid.v4(),
    owner: req.user.email,
    title: title || 'Untitled',
    completed: false,
  };
  tasks.push(task);
  res.status(201).send(task);
});

apiRouter.put('/tasks/:id', verifyAuth, (req, res) => {
  const task = tasks.find((t) => t.id === req.params.id && t.owner === req.user.email);
  if (!task) {
    res.status(404).send({ msg: 'Not found' });
    return;
  }
  if (req.body.title !== undefined) task.title = req.body.title;
  if (req.body.completed !== undefined) task.completed = Boolean(req.body.completed);
  res.send(task);
});

apiRouter.delete('/tasks/:id', verifyAuth, (req, res) => {
  const i = tasks.findIndex((t) => t.id === req.params.id && t.owner === req.user.email);
  if (i === -1) {
    res.status(404).send({ msg: 'Not found' });
    return;
  }
  tasks.splice(i, 1);
  res.status(204).end();
});

// ---- Classes ----

apiRouter.get('/classes', verifyAuth, (req, res) => {
  const list = classes
    .filter((c) => c.owner === req.user.email)
    .map((c) => c.name);
  res.send(list);
});

apiRouter.post('/classes', verifyAuth, (req, res) => {
  const name = (req.body?.name || req.body?.className || '').trim();
  if (!name) {
    res.status(400).send({ msg: 'Class name required' });
    return;
  }
  const owner = req.user.email;
  const exists = classes.some((c) => c.owner === owner && c.name === name);
  if (exists) {
    res.send(classes.filter((c) => c.owner === owner).map((c) => c.name));
    return;
  }
  classes.push({ owner, name });
  res.status(201).send(classes.filter((c) => c.owner === owner).map((c) => c.name));
});

// ---- Assignments ----

apiRouter.get('/assignments', verifyAuth, (req, res) => {
  const list = assignments
    .filter((a) => a.owner === req.user.email)
    .map((a) => ({ id: a.id, name: a.name, dueDate: a.dueDate, className: a.className }));
  res.send(list);
});

apiRouter.post('/assignments', verifyAuth, (req, res) => {
  const { name, dueDate, className } = req.body || {};
  if (!name || !dueDate) {
    res.status(400).send({ msg: 'Name and dueDate required' });
    return;
  }
  const assignment = {
    id: uuid.v4(),
    owner: req.user.email,
    name: String(name).trim(),
    dueDate: String(dueDate).trim(),
    className: String(className || '').trim(),
  };
  assignments.push(assignment);
  res.status(201).send(assignment);
});

apiRouter.delete('/assignments/:id', verifyAuth, (req, res) => {
  const i = assignments.findIndex(
    (a) => a.id === req.params.id && a.owner === req.user.email
  );
  if (i === -1) {
    res.status(404).send({ msg: 'Not found' });
    return;
  }
  assignments.splice(i, 1);
  res.status(204).end();
});

// ---- Posts ----

apiRouter.get('/posts', verifyAuth, (req, res) => {
  const list = posts
    .filter((p) => p.owner === req.user.email)
    .map((p) => ({
      id: p.id,
      author: p.owner,
      text: p.text,
      category: p.category,
      createdAt: p.createdAt,
    }));
  res.send(list);
});

apiRouter.post('/posts', verifyAuth, (req, res) => {
  const text = (req.body?.text || '').trim();
  if (!text) {
    res.status(400).send({ msg: 'Text required' });
    return;
  }
  const post = {
    id: uuid.v4(),
    owner: req.user.email,
    text,
    category: (req.body?.category || 'post').trim() || 'post',
    createdAt: new Date().toISOString(),
  };
  posts.push(post);
  res.status(201).send({
    id: post.id,
    author: post.owner,
    text: post.text,
    category: post.category,
    createdAt: post.createdAt,
  });
});

// ---- Helpers ----

async function createUser(username, email, password) {
  const user = {
    username,
    email,
    password: await bcrypt.hash(password, 10),
    token: uuid.v4(), // create an auth token for this user
  };
  users.push(user); // store the user in memory
  return user;
}

function findUserByEmail(email) {
  if (!email) return null;
  const lower = String(email).trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === lower);
}

function findUserByToken(token) {
  if (!token) return null;
  return users.find((u) => u.token === token);
}

// Set the auth token in an httpOnly cookie (secure, 1 year)
function setAuthCookie(res, authToken) {
  res.cookie(authCookieName, authToken, {
    maxAge: 1000 * 60 * 60 * 24 * 365,
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  });
}

// SPA fallback: serve index.html for unknown routes
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
