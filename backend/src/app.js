const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const urlRoutes = require('./routes/urlRoutes');
const redirectRoutes = require('./routes/redirectRoutes');

dotenv.config();

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:3000',
  'http://localhost:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy does not allow access from ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/urls', urlRoutes);
app.use('/r', redirectRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'URL Shortener API is running.' });
});

const defaultDatabase = 'url_shortener';
let mongoUri = process.env.MONGO_URI || `mongodb://localhost:27017/${defaultDatabase}`;

const uriWithDatabase = mongoUri.replace(/^(mongodb(?:\+srv)?:\/\/[^\/]+)(?:\/([^?]+))?(\?.*)?$/, (match, prefix, db, query = '') => {
  if (!db || db === '') {
    return `${prefix}/${defaultDatabase}${query}`;
  }
  return match;
});

mongoose.connect(uriWithDatabase)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

module.exports = app;
