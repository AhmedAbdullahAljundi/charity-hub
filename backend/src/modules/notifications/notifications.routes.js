const express = require('express');
const router = express.Router();
const notificationsController = require('./notifications.controller');
const { requireAuth } = require('../../middleware/auth');

// All notification routes require authentication
router.use(requireAuth);

router.get('/', notificationsController.getNotifications);
router.post('/send', notificationsController.sendDirectMessage);
router.put('/read-all', notificationsController.markAllAsRead);
router.put('/:id/read', notificationsController.markAsRead);

module.exports = router;
