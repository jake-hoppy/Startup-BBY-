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

app.use(express.json());
app.use(cookieParser());
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
  const user = findUserByEmail(email);
  if (!user || !(await bcrypt.compare(password || '', user.password))) {
    res.status(401).send({ msg: 'Unauthorized' });
    return;
  }
  user.token = uuid.v4();
  setAuthCookie(res, user.token);
  res.send({ username: user.username, email: user.email });
});

apiRouter.delete('/auth/logout', (req, res) => {
  const user = findUserByToken(req.cookies[authCookieName]);
  if (user) delete user.token;
  res.clearCookie(authCookieName);
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

// ---- Auth middleware ----

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
