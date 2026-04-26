require('dotenv').config();
const mongoose = require('mongoose');
const authController = require('./src/controllers/authController');

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/url_shortener';

mongoose.connect(mongoUri)
  .then(async () => {
    const req = {
      body: { email: `user${Date.now()}@example.com`, password: 'Password123' },
    };
    const res = {
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(payload) {
        console.log('RESPONSE', this.statusCode, payload);
      },
    };
    await authController.register(req, res);
    await mongoose.disconnect();
  })
  .catch((err) => {
    console.error('Connection error:', err);
  });
