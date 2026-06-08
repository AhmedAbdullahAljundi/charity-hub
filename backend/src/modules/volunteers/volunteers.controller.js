const volunteersService = require('./volunteers.service');

const volunteersController = {
  list: async (req, res, next) => {
    try {
      const { page = 1, limit = 20, search = '', status = '', area = '' } = req.query;
      const data = await volunteersService.listVolunteers({
        page: Number(page),
        limit: Math.min(Number(limit), 100),
        search,
        status,
        area
      });
      res.json({ success: true, data });
    } catch (e) { next(e); }
  },

  getOne: async (req, res, next) => {
    try {
      const data = await volunteersService.getVolunteerById(req.params.id);
      res.json({ success: true, data });
    } catch (e) { next(e); }
  },

  create: async (req, res, next) => {
    try {
      const { name, nationalId, phone, whatsapp, address, assignedArea, specialties } = req.body;
      if (!name) return res.status(400).json({ success: false, error: 'الاسم مطلوب' });
      
      const volunteer = await volunteersService.createVolunteer({
        name, nationalId, phone, whatsapp, address, assignedArea, specialties
      });
      res.status(201).json({ success: true, data: volunteer });
    } catch (e) { next(e); }
  },

  update: async (req, res, next) => {
    try {
      const volunteer = await volunteersService.updateVolunteer(req.params.id, req.body);
      res.json({ success: true, data: volunteer });
    } catch (e) { next(e); }
  },

  remove: async (req, res, next) => {
    try {
      await volunteersService.deleteVolunteer(req.params.id);
      res.json({ success: true, message: 'تم الحذف بنجاح' });
    } catch (e) { next(e); }
  },

  assignTask: async (req, res, next) => {
    try {
      const { title, description, householdId, priority, dueDate } = req.body;
      if (!title) return res.status(400).json({ success: false, error: 'عنوان المهمة مطلوب' });
      
      const task = await volunteersService.assignTask(
        req.params.id,
        { title, description, householdId, priority, dueDate },
        req.user.userId
      );
      res.status(201).json({ success: true, data: task });
    } catch (e) { next(e); }
  },

  updateTaskStatus: async (req, res, next) => {
    try {
      const { status } = req.body;
      if (!status) return res.status(400).json({ success: false, error: 'حالة المهمة مطلوبة' });
      const task = await volunteersService.updateTaskStatus(req.params.taskId, status);
      res.json({ success: true, data: task });
    } catch (e) { next(e); }
  }
};

module.exports = volunteersController;
