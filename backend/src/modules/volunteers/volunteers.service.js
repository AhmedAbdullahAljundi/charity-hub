const prisma = require('../../config/prisma');

const volunteersService = {
  // Volunteers CRUD
  listVolunteers: async ({ page, limit, search, status, area }) => {
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { nationalId: { contains: search } },
      ];
    }
    if (status) where.status = status;
    if (area) where.assignedArea = { contains: area, mode: 'insensitive' };

    const total = await prisma.volunteer.count({ where });
    const data = await prisma.volunteer.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        tasks: {
          select: { id: true, title: true, status: true, priority: true },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    return { total, pages: Math.ceil(total / limit), data };
  },

  getVolunteerById: async (id) => {
    const volunteer = await prisma.volunteer.findUnique({
      where: { id },
      include: {
        assignedHouseholds: true,
        tasks: {
          orderBy: { createdAt: 'desc' },
          include: { household: true }
        }
      }
    });
    if (!volunteer) throw { status: 404, message: 'المتطوع غير موجود' };
    return volunteer;
  },

  createVolunteer: async (data) => {
    return prisma.volunteer.create({ data });
  },

  updateVolunteer: async (id, data) => {
    return prisma.volunteer.update({
      where: { id },
      data,
    });
  },

  deleteVolunteer: async (id) => {
    return prisma.volunteer.delete({ where: { id } });
  },

  // Tasks Management
  assignTask: async (volunteerId, taskData, supervisorId) => {
    // default 30 days if not provided
    let dueDate = taskData.dueDate;
    if (!dueDate) {
      const date = new Date();
      date.setDate(date.getDate() + 30);
      dueDate = date;
    }

    return prisma.volunteerTask.create({
      data: {
        volunteerId,
        householdId: taskData.householdId,
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority || 'MEDIUM',
        dueDate: new Date(dueDate),
        createdById: supervisorId,
      }
    });
  },

  updateTaskStatus: async (taskId, status) => {
    const data = { status };
    if (status === 'COMPLETED') {
      data.completedAt = new Date();
    }
    return prisma.volunteerTask.update({
      where: { id: taskId },
      data
    });
  }
};

module.exports = volunteersService;
