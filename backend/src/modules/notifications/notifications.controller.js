const notificationsService = require('./notifications.service');

const getNotifications = async (req, res, next) => {
  try {
    const notifications = await notificationsService.getNotifications(req.user.userId);
    res.json({ success: true, data: notifications });
  } catch (e) { next(e); }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await notificationsService.markAsRead(id, req.user.userId);
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (e) { next(e); }
};

const markAllAsRead = async (req, res, next) => {
  try {
    await notificationsService.markAllAsRead(req.user.userId);
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (e) { next(e); }
};

const sendDirectMessage = async (req, res, next) => {
  try {
    const { targetUserId, message } = req.body;
    if (!targetUserId || !message) {
      return res.status(400).json({ success: false, error: 'targetUserId and message are required' });
    }

    await notificationsService.sendDirectMessage(req.user.userId, targetUserId, message);
    res.json({ success: true, message: 'Message sent successfully' });
  } catch (e) { next(e); }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  sendDirectMessage,
};
