const http = require('http');
const express = require('express');
const WebSocket = require('ws');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
const uuid = require('uuid');
const { connectMongo, getDb } = require('./db');

const app = express();
const port = process.argv.length > 2 ? process.argv[2] : 4000;
const authCookieName = 'token';

app.use(express.json());
app.use(cookieParser());

app.use(express.static('public'));

const apiRouter = express.Router();
app.use('/api', apiRouter);

// ---- Auth ----

apiRouter.post('/auth/create', async (req, res) => {
  try {
    const { username, email, password } = req.body || {};
    if (!username || !email || !password) {
      res.status(400).send({ msg: 'Username, email, and password required' });
      return;
    }
    const emailNorm = String(email).trim().toLowerCase();
    if (await findUserByEmail(emailNorm)) {
      res.status(409).send({ msg: 'Existing user' });
      return;
    }
    const user = await createUser(username.trim(), emailNorm, password);
    setAuthCookie(req, res, user.token);
    res.send({ username: user.username, email: user.email });
  } catch (e) {
    if (e.code === 11000) {
      res.status(409).send({ msg: 'Existing user' });
      return;
    }
    console.error(e);
    res.status(500).send({ msg: 'Server error' });
  }
});

apiRouter.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = await findUserByEmail(email);
    if (!user || !(await bcrypt.compare(password || '', user.password))) {
      res.status(401).send({ msg: 'Unauthorized' });
      return;
    }
    const newToken = uuid.v4();
    await getDb()
      .collection('users')
      .updateOne({ email: user.email }, { $set: { token: newToken } });
    user.token = newToken;
    setAuthCookie(req, res, newToken);
    res.send({ username: user.username, email: user.email });
  } catch (e) {
    console.error(e);
    res.status(500).send({ msg: 'Server error' });
  }
});

apiRouter.delete('/auth/logout', async (req, res) => {
  try {
    const user = await findUserByToken(req.cookies[authCookieName]);
    if (user) {
      await getDb().collection('users').updateOne({ email: user.email }, { $set: { token: null } });
    }
    res.clearCookie(authCookieName);
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.clearCookie(authCookieName);
    res.status(204).end();
  }
});

apiRouter.get('/user/me', async (req, res) => {
  try {
    const user = await findUserByToken(req.cookies[authCookieName]);
    if (!user) {
      res.status(401).send({ msg: 'Unauthorized' });
      return;
    }
    res.send({ username: user.username, email: user.email });
  } catch (e) {
    console.error(e);
    res.status(500).send({ msg: 'Server error' });
  }
});

async function verifyAuth(req, res, next) {
  try {
    const user = await findUserByToken(req.cookies[authCookieName]);
    if (!user) {
      res.status(401).send({ msg: 'Unauthorized' });
      return;
    }
    req.user = user;
    next();
  } catch (e) {
    console.error(e);
    res.status(500).send({ msg: 'Server error' });
  }
}

// ---- Tasks ----

apiRouter.get('/tasks', verifyAuth, async (req, res) => {
  try {
    const list = await getDb()
      .collection('tasks')
      .find({ ownerEmail: req.user.email })
      .project({ _id: 0 })
      .toArray();
    const out = list.map((t) => ({
      id: t.id,
      owner: t.ownerEmail,
      title: t.title,
      completed: t.completed,
    }));
    res.send(out);
  } catch (e) {
    console.error(e);
    res.status(500).send({ msg: 'Server error' });
  }
});

apiRouter.post('/tasks', verifyAuth, async (req, res) => {
  try {
    const { title } = req.body || {};
    const task = {
      id: uuid.v4(),
      ownerEmail: req.user.email,
      title: title || 'Untitled',
      completed: false,
    };
    await getDb().collection('tasks').insertOne(task);
    res.status(201).send({
      id: task.id,
      owner: task.ownerEmail,
      title: task.title,
      completed: task.completed,
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({ msg: 'Server error' });
  }
});

apiRouter.put('/tasks/:id', verifyAuth, async (req, res) => {
  try {
    const filter = { id: req.params.id, ownerEmail: req.user.email };
    const updates = {};
    if (req.body.title !== undefined) updates.title = req.body.title;
    if (req.body.completed !== undefined) updates.completed = Boolean(req.body.completed);
    if (Object.keys(updates).length > 0) {
      await getDb().collection('tasks').updateOne(filter, { $set: updates });
    }
    const doc = await getDb().collection('tasks').findOne(filter);
    if (!doc) {
      res.status(404).send({ msg: 'Not found' });
      return;
    }
    res.send({
      id: doc.id,
      owner: doc.ownerEmail,
      title: doc.title,
      completed: doc.completed,
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({ msg: 'Server error' });
  }
});

apiRouter.delete('/tasks/:id', verifyAuth, async (req, res) => {
  try {
    const r = await getDb().collection('tasks').deleteOne({
      id: req.params.id,
      ownerEmail: req.user.email,
    });
    if (r.deletedCount === 0) {
      res.status(404).send({ msg: 'Not found' });
      return;
    }
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).send({ msg: 'Server error' });
  }
});

// ---- Classes ----

apiRouter.get('/classes', verifyAuth, async (req, res) => {
  try {
    const docs = await getDb()
      .collection('classes')
      .find({ ownerEmail: req.user.email })
      .project({ name: 1, _id: 0 })
      .toArray();
    res.send(docs.map((c) => c.name));
  } catch (e) {
    console.error(e);
    res.status(500).send({ msg: 'Server error' });
  }
});

apiRouter.post('/classes', verifyAuth, async (req, res) => {
  try {
    const name = (req.body?.name || req.body?.className || '').trim();
    if (!name) {
      res.status(400).send({ msg: 'Class name required' });
      return;
    }
    const ownerEmail = req.user.email;
    const col = getDb().collection('classes');
    await col.updateOne(
      { ownerEmail, name },
      { $setOnInsert: { ownerEmail, name } },
      { upsert: true }
    );
    const docs = await col.find({ ownerEmail }).project({ name: 1, _id: 0 }).toArray();
    res.status(201).send(docs.map((c) => c.name));
  } catch (e) {
    console.error(e);
    res.status(500).send({ msg: 'Server error' });
  }
});

// ---- Assignments ----

apiRouter.get('/assignments', verifyAuth, async (req, res) => {
  try {
    const list = await getDb()
      .collection('assignments')
      .find({ ownerEmail: req.user.email })
      .project({ _id: 0, ownerEmail: 0 })
      .toArray();
    res.send(
      list.map((a) => ({
        id: a.id,
        name: a.name,
        dueDate: a.dueDate,
        className: a.className,
      }))
    );
  } catch (e) {
    console.error(e);
    res.status(500).send({ msg: 'Server error' });
  }
});

apiRouter.post('/assignments', verifyAuth, async (req, res) => {
  try {
    const { name, dueDate, className } = req.body || {};
    if (!name || !dueDate) {
      res.status(400).send({ msg: 'Name and dueDate required' });
      return;
    }
    const assignment = {
      id: uuid.v4(),
      ownerEmail: req.user.email,
      name: String(name).trim(),
      dueDate: String(dueDate).trim(),
      className: String(className || '').trim(),
    };
    await getDb().collection('assignments').insertOne(assignment);
    res.status(201).send({
      id: assignment.id,
      name: assignment.name,
      dueDate: assignment.dueDate,
      className: assignment.className,
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({ msg: 'Server error' });
  }
});

apiRouter.delete('/assignments/:id', verifyAuth, async (req, res) => {
  try {
    const r = await getDb().collection('assignments').deleteOne({
      id: req.params.id,
      ownerEmail: req.user.email,
    });
    if (r.deletedCount === 0) {
      res.status(404).send({ msg: 'Not found' });
      return;
    }
    res.status(204).end();
  } catch (e) {
    console.error(e);
    res.status(500).send({ msg: 'Server error' });
  }
});

// ---- Posts ----

apiRouter.get('/posts', verifyAuth, async (req, res) => {
  try {
    const list = await getDb()
      .collection('posts')
      .find({ ownerEmail: req.user.email })
      .sort({ createdAt: -1 })
      .project({ _id: 0 })
      .toArray();
    res.send(
      list.map((p) => ({
        id: p.id,
        author: p.ownerEmail,
        text: p.text,
        category: p.category,
        createdAt: p.createdAt,
      }))
    );
  } catch (e) {
    console.error(e);
    res.status(500).send({ msg: 'Server error' });
  }
});

apiRouter.post('/posts', verifyAuth, async (req, res) => {
  try {
    const text = (req.body?.text || '').trim();
    if (!text) {
      res.status(400).send({ msg: 'Text required' });
      return;
    }
    const post = {
      id: uuid.v4(),
      ownerEmail: req.user.email,
      text,
      category: (req.body?.category || 'post').trim() || 'post',
      createdAt: new Date().toISOString(),
    };
    await getDb().collection('posts').insertOne(post);
    res.status(201).send({
      id: post.id,
      author: post.ownerEmail,
      text: post.text,
      category: post.category,
      createdAt: post.createdAt,
    });
  } catch (e) {
    console.error(e);
    res.status(500).send({ msg: 'Server error' });
  }
});

// ---- Helpers ----

async function createUser(username, email, password) {
  const hash = await bcrypt.hash(password, 10);
  const token = uuid.v4();
  const doc = { username, email, password: hash, token };
  await getDb().collection('users').insertOne(doc);
  return { username, email, password: hash, token };
}

async function findUserByEmail(email) {
  if (!email) return null;
  const lower = String(email).trim().toLowerCase();
  return await getDb().collection('users').findOne({ email: lower });
}

async function findUserByToken(token) {
  if (!token) return null;
  return await getDb().collection('users').findOne({ token });
}

function setAuthCookie(req, res, authToken) {
  const isLocalhost = req.hostname === 'localhost' || req.hostname === '127.0.0.1';
  const secure = !isLocalhost && process.env.NODE_ENV === 'production';
  res.cookie(authCookieName, authToken, {
    maxAge: 1000 * 60 * 60 * 24 * 365,
    secure,
    httpOnly: true,
    sameSite: 'strict',
  });
}

app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

function getTokenFromCookieHeader(header) {
  if (!header) return null;
  const m = header.match(new RegExp(`(?:^|;\\s*)${authCookieName}=([^;]+)`));
  return m ? decodeURIComponent(m[1].trim()) : null;
}

function broadcastWs(data) {
  const s = JSON.stringify(data);
  for (const c of wss.clients) {
    if (c.readyState === WebSocket.OPEN) c.send(s);
  }
}

wss.on('connection', async (ws, req) => {
  const token = getTokenFromCookieHeader(req.headers.cookie);
  const chatUser = token ? await findUserByToken(token) : null;
  if (!chatUser) {
    ws.close(4401, 'Unauthorized');
    return;
  }
  ws.user = { username: chatUser.username, email: chatUser.email };
});

async function start() {
  await connectMongo();
  server.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}

start().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
