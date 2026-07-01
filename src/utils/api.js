const API_BASE = 'http://127.0.0.1:3001/api';

export const api = {
  async register(email, password, name) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to register.');
    }
    return res.json();
  },

  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to login.');
    }
    return res.json();
  },

  async sync(email, data) {
    const res = await fetch(`${API_BASE}/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, data })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to sync data.');
    }
    return res.json();
  }
};
