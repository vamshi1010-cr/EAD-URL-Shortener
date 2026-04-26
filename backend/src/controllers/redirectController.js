const axios = require('axios');
const UAParser = require('ua-parser-js');
const Url = require('../models/Url');
const Analytics = require('../models/Analytics');

const getClientIp = (req) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const ip = req.ip || req.connection.remoteAddress;
  if (ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1') {
    return 'localhost';
  }

  return ip;
};

const getLocation = async (ip) => {
  if (ip === 'localhost') {
    return 'Hyderabad, IN';
  }

  try {
    const response = await axios.get(`https://ipapi.co/${ip}/json/`, { timeout: 3000 });
    const { city, region, country_name } = response.data || {};
    return [city, region, country_name].filter(Boolean).join(', ') || 'Unknown';
  } catch (error) {
    console.error('IP lookup failed:', error.message);
    return 'Unknown';
  }
};

const normalizeDevice = (userAgent) => {
  const parser = new UAParser(userAgent);
  const deviceType = parser.getDevice().type;

  if (deviceType === 'mobile') return 'Mobile';
  if (deviceType === 'tablet') return 'Tablet';
  return 'Desktop';
};

exports.redirectToOriginal = async (req, res) => {
  const { code } = req.params;
  const userAgent = req.headers['user-agent'] || '';
  const ip = getClientIp(req);
  const device = normalizeDevice(userAgent);

  try {
    const url = await Url.findOne({ shortCode: code });
    if (!url) {
      return res.status(404).send('Short URL not found.');
    }

    const redirectUrl = url.originalUrl;
    res.redirect(302, redirectUrl);

    setImmediate(async () => {
      try {
        const location = await getLocation(ip);
        await Analytics.create({
          urlId: url._id,
          device,
          location,
          timestamp: new Date(),
        });
        await Url.findByIdAndUpdate(url._id, { $inc: { clicks: 1 } });
      } catch (backgroundError) {
        console.error('Analytics background task failed:', backgroundError);
      }
    });
  } catch (error) {
    console.error('Redirect error:', error);
    return res.status(500).send('Redirect failed.');
  }
};
