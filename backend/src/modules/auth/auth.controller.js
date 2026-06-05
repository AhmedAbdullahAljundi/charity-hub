const authService = require('./auth.service');
const { validateLogin, validateRefresh } = require('./auth.validator');

const authController = {
  login: async (req, res, next) => {
    try {
      const v = validateLogin(req.body);
      if (!v.isValid) {
        return res.status(400).json({ success: false, errors: v.errors });
      }
      const data = await authService.login(v.value.email, v.value.password);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  refresh: async (req, res, next) => {
    try {
      const v = validateRefresh(req.body);
      if (!v.isValid) {
        return res.status(400).json({ success: false, errors: v.errors });
      }
      const data = await authService.refresh(v.value.refreshToken);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  logout: async (req, res, next) => {
    try {
      await authService.logout(req.body?.refreshToken);
      res.json({ success: true, message: 'Logged out' });
    } catch (e) {
      next(e);
    }
  },

  me: async (req, res, next) => {
    try {
      const user = await authService.getUserById(req.user.userId);
      res.json({ success: true, data: user });
    } catch (e) {
      next(e);
    }
  },

  forgotPassword: async (req, res, next) => {
    try {
      const { email } = req.body;
      if (!email || typeof email !== 'string') {
        // Always return 200 to prevent enumeration
        return res.json({ success: true, message: 'ok' });
      }
      await authService.forgotPassword(email);
      res.json({ success: true, message: 'ok' });
    } catch (e) {
      // Always return 200
      res.json({ success: true, message: 'ok' });
    }
  },

  changePassword: async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, error: 'الحقول مطلوبة' });
      }
      await authService.changePassword(req.user.userId, currentPassword, newPassword);
      res.json({ success: true, message: 'تم تغيير كلمة المرور بنجاح' });
    } catch (e) {
      next(e);
    }
  },
};

module.exports = authController;
