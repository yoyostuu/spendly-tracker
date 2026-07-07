import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'database.json');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize database file fallback if it doesn't exist
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ users: {} }, null, 2));
}

// Connect to MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI;
let isCloudDB = false;

if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('[Spendly Database] Connected to MongoDB Atlas Cloud');
      isCloudDB = true;
    })
    .catch(err => {
      console.error('[Spendly Database] Failed to connect to MongoDB Atlas, falling back to local database.json', err);
    });
} else {
  console.log('[Spendly Database] No MONGODB_URI found, using local database.json fallback');
}

// MongoDB User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, default: 'Student' },
  data: {
    name: { type: String, default: 'Student' },
    transactions: { type: Array, default: [] },
    loans: { type: Array, default: [] },
    balance: { type: Number, default: 5000 },
    foodBudget: { type: Number, default: null },
    travelBudget: { type: Number, default: null },
    savings: {
      goalName: { type: String, default: '' },
      goalAmount: { type: Number, default: null },
      currentAmount: { type: Number, default: 0 }
    },
    reminders: {
      enabled: { type: Boolean, default: false },
      time: { type: String, default: '20:00' },
      browserEnabled: { type: Boolean, default: false },
      emailEnabled: { type: Boolean, default: false }
    }
  }
});

const User = mongoose.model('User', userSchema);

// Helper to read DB (local fallback)
const readDB = () => {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading database file, resetting...', err);
    return { users: {} };
  }
};

// Helper to write DB (local fallback)
const writeDB = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing to database file...', err);
  }
};

// Auth: Register
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  if (isCloudDB) {
    try {
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(400).json({ error: 'An account with this email already exists. Please log in instead.' });
      }
      const newUser = new User({
        email: normalizedEmail,
        password, // Simple storage for demo/learning purposes
        name: name ? name.trim() : 'Student',
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
      });
      await newUser.save();
      return res.status(201).json({ message: 'Registration successful', email: normalizedEmail });
    } catch (err) {
      console.error('Cloud registration error:', err);
      return res.status(500).json({ error: 'Database error during account registration.' });
    }
  } else {
    // Fallback Local
    const db = readDB();
    if (db.users[normalizedEmail]) {
      return res.status(400).json({ error: 'An account with this email already exists. Please log in instead.' });
    }

    db.users[normalizedEmail] = {
      email: normalizedEmail,
      password: password,
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
    return res.status(201).json({ message: 'Registration successful', email: normalizedEmail });
  }
});

// Auth: Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  if (isCloudDB) {
    try {
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return res.status(404).json({ error: 'No account found with this email. Please create an account instead.' });
      }
      if (user.password !== password) {
        return res.status(401).json({ error: 'Incorrect password. Please try again.' });
      }

      return res.status(200).json({
        message: 'Login successful',
        email: normalizedEmail,
        data: user.data
      });
    } catch (err) {
      console.error('Cloud login error:', err);
      return res.status(500).json({ error: 'Database error during account authentication.' });
    }
  } else {
    // Fallback Local
    const db = readDB();
    const user = db.users[normalizedEmail];

    if (!user) {
      return res.status(404).json({ error: 'No account found with this email. Please create an account instead.' });
    }
    if (user.password !== password) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }

    return res.status(200).json({
      message: 'Login successful',
      email: normalizedEmail,
      data: user.data
    });
  }
});

// Sync: Pull & Push Data
app.post('/api/sync', async (req, res) => {
  const { email, data } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required for syncing.' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  if (isCloudDB) {
    try {
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        return res.status(404).json({ error: 'User not found.' });
      }

      // Update user's data on the cloud database
      user.data = data;
      await user.save();

      return res.status(200).json({
        message: 'Data synced successfully',
        data: user.data
      });
    } catch (err) {
      console.error('Cloud sync error:', err);
      return res.status(500).json({ error: 'Database error during cloud synchronization.' });
    }
  } else {
    // Fallback Local
    const db = readDB();
    const user = db.users[normalizedEmail];

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    user.data = data;
    writeDB(db);

    return res.status(200).json({
      message: 'Data synced successfully',
      data: user.data
    });
  }
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy', database: isCloudDB ? 'cloud' : 'local' });
});

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Spendly Server] Listening on port ${PORT}`);
  });
}

export default app;
