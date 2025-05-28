const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

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
