const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { createShortUrl, getUrls, getClicksLast7Days } = require('../controllers/urlController');

router.post('/', auth, createShortUrl);
router.get('/', auth, getUrls);
router.get('/analytics/last-7-days', auth, getClicksLast7Days);

module.exports = router;


