const usersService = require('./users.service');

const usersController = {
  list: async (req, res, next) => {
    try {
      const { page = 1, limit = 20, search = '', role = '' } = req.query;
      const data = await usersService.listUsers({
        page: Number(page),
        limit: Math.min(Number(limit), 100),
        search,
        role,
      });
      res.json({ success: true, data });
    } catch (e) { next(e); }
  },

  getOne: async (req, res, next) => {
    try {
      const user = await usersService.getUserById(req.params.id);
      res.json({ success: true, data: user });
    } catch (e) { next(e); }
  },

  create: async (req, res, next) => {
    try {
      const { name, email, password, role, governorate, district, preferredLocale } = req.body;
      if (!name || !email || !password || !role) {
        return res.status(400).json({ success: false, error: 'الحقول المطلوبة: الاسم، البريد، كلمة المرور، الدور' });
      }
      const user = await usersService.createUser({ name, email, password, role, governorate, district, preferredLocale });
      res.status(201).json({ success: true, data: user });
    } catch (e) {
      if (e.status) return res.status(e.status).json({ success: false, error: e.message, code: e.code });
      next(e);
    }
  },

  update: async (req, res, next) => {
    try {
      const user = await usersService.updateUser(req.params.id, req.body);
      res.json({ success: true, data: user });
    } catch (e) {
      if (e.status) return res.status(e.status).json({ success: false, error: e.message });
      next(e);
    }
  },

  remove: async (req, res, next) => {
    try {
      await usersService.softDeleteUser(req.params.id);
      res.json({ success: true, message: 'تم تعطيل الحساب' });
    } catch (e) { next(e); }
  },

  changeRole: async (req, res, next) => {
    try {
      const { role } = req.body;
      if (!role) return res.status(400).json({ success: false, error: 'الدور مطلوب' });
      const user = await usersService.changeRole(req.params.id, role, req.user.userId);
      res.json({ success: true, data: user });
    } catch (e) {
      if (e.status) return res.status(e.status).json({ success: false, error: e.message });
      next(e);
    }
  },

  setPermissions: async (req, res, next) => {
    try {
      const { customPermissions } = req.body;
      if (!Array.isArray(customPermissions)) {
        return res.status(400).json({ success: false, error: 'customPermissions يجب أن يكون مصفوفة' });
      }
      const data = await usersService.setCustomPermissions(req.params.id, customPermissions, req.user.userId);
      res.json({ success: true, data });
    } catch (e) {
      if (e.status) return res.status(e.status).json({ success: false, error: e.message, invalid: e.invalid });
      next(e);
    }
  },

  setTempPassword: async (req, res, next) => {
    try {
      const { tempPassword } = req.body;
      if (!tempPassword) return res.status(400).json({ success: false, error: 'كلمة المرور المؤقتة مطلوبة' });
      const data = await usersService.setTempPassword(req.params.id, tempPassword, req.user.userId);
      res.json({ success: true, ...data });
    } catch (e) {
      if (e.status) return res.status(e.status).json({ success: false, error: e.message });
      next(e);
    }
  },
};

module.exports = usersController;
