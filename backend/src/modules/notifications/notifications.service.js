const prisma = require('../../shared/prisma');

async function getNotifications(userId) {
  return await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

async function markAsRead(notificationId, userId) {
  // Ensure the notification belongs to the user
  const notif = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notif || notif.userId !== userId) {
    throw new Error('Notification not found or unauthorized');
  }

  return await prisma.notification.update({
    where: { id: notificationId },
    data: { read: true },
  });
}

async function markAllAsRead(userId) {
  return await prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

async function createNotification({ userId, title, message, type = 'info', link = null }) {
  return await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      link,
    },
  });
}

async function notifyAdmins({ title, message, type = 'info', link = null }) {
  // Find all active ADMIN users
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN', active: true },
    select: { id: true },
  });

  if (!admins.length) return;

  const data = admins.map((admin) => ({
    userId: admin.id,
    title,
    message,
    type,
    link,
  }));

  // Create notifications in bulk
  return await prisma.notification.createMany({
    data,
  });
}

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  notifyAdmins,
};
