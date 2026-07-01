import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'database.json');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize database file if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ users: {} }, null, 2));
}

// Helper to read DB
const readDB = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading database file, resetting...', err);
    return { users: {} };
  }
};

// Helper to write DB
const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing to database file...', err);
  }
};

// Auth: Register
app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const db = readDB();
  const normalizedEmail = email.toLowerCase().trim();

  if (db.users[normalizedEmail]) {
    return res.status(400).json({ error: 'User already exists.' });
  }

  db.users[normalizedEmail] = {
    email: normalizedEmail,
    password: password, // simple storage for demo purposes
    data: {
      name: name ? name.trim() : 'Student',
      transactions: [],
      loans: [],
      balance: 5000,
      foodBudget: null,
      travelBudget: null,
      savings: { goalName: '', goalAmount: null, currentAmount: 0 },
      reminders: { enabled: false, time: '20:00', browserEnabled: false, emailEnabled: false }
    }
  };

  writeDB(db);
  res.status(201).json({ message: 'Registration successful', email: normalizedEmail });
});

// Auth: Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const db = readDB();
  const normalizedEmail = email.toLowerCase().trim();
  const user = db.users[normalizedEmail];

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  res.status(200).json({
    message: 'Login successful',
    email: normalizedEmail,
    data: user.data
  });
});

// Sync: Pull & Push Data
app.post('/api/sync', (req, res) => {
  const { email, data } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required for syncing.' });
  }

  const db = readDB();
  const normalizedEmail = email.toLowerCase().trim();
  const user = db.users[normalizedEmail];

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  // Update user's data on the server
  user.data = data;
  writeDB(db);

  res.status(200).json({
    message: 'Data synced successfully',
    data: user.data
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Spendly Server] Listening on port ${PORT}`);
  });
}

module.exports = app;
