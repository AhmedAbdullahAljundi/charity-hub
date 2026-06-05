const express = require('express');
const router = express.Router();
const { notifyAdmins } = require('../notifications/notifications.service');

// Public endpoint for "Contact Us" form on the landing page
router.post('/contact', async (req, res, next) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, error: 'Name, email, and message are required' });
    }

    // Send a notification to all ADMIN users
    await notifyAdmins({
      title: `رسالة تواصل جديدة من ${name}`,
      message: `البريد: ${email}\n\nالرسالة: ${message}`,
      type: 'info',
    });

    res.json({ success: true, message: 'Message sent successfully' });
  } catch (e) { next(e); }
});

module.exports = router;
