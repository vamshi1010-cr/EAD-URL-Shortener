const express = require('express');
const router = express.Router();
const { redirectToOriginal } = require('../controllers/redirectController');

router.get('/:code', redirectToOriginal);

module.exports = router;
