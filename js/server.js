const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
// Google Apps Script Web App URL (use your /exec URL or set env GAS_URL)
const GAS_URL = process.env.GAS_URL || 'https://script.google.com/macros/s/AKfycbwD4cwFwFMFk8-HOeMnULcYrUQwuRh9UDL_x7rMcPMp5fYPqKdI4hJaJ0UdxfvnIsUHZg/exec';

// Proxy to GAS to avoid browser CORS
app.post('/api/sheet', async (req, res) => {
  try {
    if (!GAS_URL) {
      return res.status(500).json({ ok: false, error: 'GAS_URL not configured on server' });
    }
    const upstream = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const text = await upstream.text();
    res.status(upstream.status).send(text);
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});


// Dummy token for demo purpose — replace with your real auth logic
const VALID_TOKEN = 'your-secret-token';

// Auth middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Missing auth token' });

  const token = authHeader.split(' ')[1];
  if (token !== VALID_TOKEN) return res.status(403).json({ message: 'Invalid token' });

  next();
}

// In-memory storage for properties
let properties = [];

// POST /api/properties — Add a new property
app.post('/api/properties', authenticateToken, (req, res) => {
  const { title, description, price, location, imageUrl } = req.body;

  // Basic validation
  if (!title || !description || !price || !location || !imageUrl) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  const newProperty = {
    id: properties.length + 1,
    title,
    description,
    price,
    location,
    imageUrl,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  properties.push(newProperty);

  res.status(201).json({ message: 'Property added', property: newProperty });
});

// GET /api/properties — Get all properties (optional)
app.get('/api/properties', (req, res) => {
  res.json(properties);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
