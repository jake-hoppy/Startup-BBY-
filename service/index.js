const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const express = require('express');
const uuid = require('uuid');
const app = express();

const authCookieName = 'token';

// In-memory store (replace with DB when ready)
let users = [];

// Service port. In production the front-end is statically hosted by the service on the same port.
const port = process.argv.length > 2 ? process.argv[2] : 3000;

app.use(express.json());
app.use(cookieParser());

// Serve front-end static content
app.use(express.static('public'));

const apiRouter = express.Router();
app.use('/api', apiRouter);

// Create user
apiRouter.post('/auth/create', async (req, res) => {
  if (findUserByEmail(req.body.email)) {
    res.status(409).send({ msg: 'Existing user' });
    return;
  }
  const user = await createUser(req.body.email, req.body.password);
  setAuthCookie(res, user.token);
  res.send({ email: user.email });
});

// Login
apiRouter.post('/auth/login', async (req, res) => {
  const user = findUserByEmail(req.body.email);
  if (user && (await bcrypt.compare(req.body.password, user.password))) {
    user.token = uuid.v4();
    setAuthCookie(res, user.token);
    res.send({ email: user.email });
    return;
  }
  res.status(401).send({ msg: 'Unauthorized' });
});

// Logout
apiRouter.delete('/auth/logout', (req, res) => {
  const user = findUserByToken(req.cookies[authCookieName]);
  if (user) delete user.token;
  res.clearCookie(authCookieName);
  res.status(204).end();
});

const verifyAuth = (req, res, next) => {
  const user = findUserByToken(req.cookies[authCookieName]);
  if (user) {
    req.user = user;
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
};

// Placeholder API routes (extend with real data stores as needed)
apiRouter.get('/user', verifyAuth, (req, res) => {
  res.send({ email: req.user.email });
});

app.use((err, req, res, next) => {
  res.status(500).send({ type: err.name, message: err.message });
});

app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

async function createUser(email, password) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    email: (email || '').trim(),
    password: passwordHash,
    token: uuid.v4(),
  };
  users.push(user);
  return user;
}

function findUserByEmail(email) {
  if (!email) return null;
  const lower = email.trim().toLowerCase();
  return users.find((u) => u.email.toLowerCase() === lower);
}

function findUserByToken(token) {
  if (!token) return null;
  return users.find((u) => u.token === token);
}

function setAuthCookie(res, authToken) {
  res.cookie(authCookieName, authToken, {
    maxAge: 1000 * 60 * 60 * 24 * 365,
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  });
}

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
