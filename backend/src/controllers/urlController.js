const { nanoid } = require('nanoid');
const QRCode = require('qrcode');
const Url = require('../models/Url');
const Analytics = require('../models/Analytics');

exports.createShortUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;
    if (!originalUrl) {
      return res.status(400).json({ message: 'originalUrl is required.' });
    }

    const shortCode = nanoid(8);
   // Use a specific BASE_URL for redirects (the Render URL)
const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
const shortUrl = `${baseUrl}/r/${shortCode}`;

    const qrCodeData = await QRCode.toDataURL(shortUrl);

    const url = await Url.create({
      originalUrl,
      shortCode,
      userId: req.user.id,
      qrCodeData,
    });

    res.status(201).json({
      url,
      shortUrl,
    });
  } catch (error) {
    console.error('Create Short URL error:', error);
    res.status(500).json({ message: 'Unable to create short URL.' });
  }
};

exports.getUrls = async (req, res) => {
  try {
    const urls = await Url.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ urls });
  } catch (error) {
    console.error('Get URLs error:', error);
    res.status(500).json({ message: 'Unable to fetch URLs.' });
  }
};

exports.getClicksLast7Days = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const urlIds = await Url.find({ userId: req.user.id }).distinct('_id');

    const clicksByDay = await Analytics.aggregate([
      { $match: { urlId: { $in: urlIds }, timestamp: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$timestamp', timezone: 'UTC' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ clicksByDay });
  } catch (error) {
    console.error('Get clicks error:', error);
    res.status(500).json({ message: 'Unable to fetch analytics.' });
  }
};
