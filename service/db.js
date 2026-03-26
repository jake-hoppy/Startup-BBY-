const { MongoClient, ServerApiVersion } = require('mongodb');
const path = require('path');
const fs = require('fs');

let client;
let db;

/**
 * Connect via MONGODB_URI (production) or ../dbConfig.json (local dev, gitignored).
 */
async function connectMongo() {
  let uri;
  let database = process.env.MONGODB_DB || 'startup-bby';

  if (process.env.MONGODB_URI) {
    uri = process.env.MONGODB_URI;
    if (process.env.MONGODB_DB) database = process.env.MONGODB_DB;
  } else {
    const configPath = path.join(__dirname, '..', 'dbConfig.json');
    if (!fs.existsSync(configPath)) {
      throw new Error(
        'Set MONGODB_URI or add dbConfig.json in project root (copy dbConfig.example.json).'
      );
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const { hostname, database: dbName, username, password } = config;
    if (!hostname || !username || !password) {
      throw new Error('dbConfig.json must include hostname, username, and password');
    }
    if (dbName) database = dbName;
    uri = `mongodb+srv://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${hostname}/?appName=startupBBY`;
  }

  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  await client.connect();
  db = client.db(database);
  await db.command({ ping: 1 });
  console.log('MongoDB connected:', database);

  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('classes').createIndex({ ownerEmail: 1, name: 1 }, { unique: true });
  await db.collection('assignments').createIndex({ ownerEmail: 1 });
  await db.collection('posts').createIndex({ ownerEmail: 1 });
  await db.collection('tasks').createIndex({ ownerEmail: 1 });
}

function getDb() {
  if (!db) throw new Error('Database not connected');
  return db;
}

module.exports = { connectMongo, getDb };
