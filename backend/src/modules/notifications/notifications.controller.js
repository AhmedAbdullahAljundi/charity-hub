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

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
  getNotifications,
  markAsRead,
  markAllAsRead,
};
