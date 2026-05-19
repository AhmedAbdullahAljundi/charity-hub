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
};

module.exports = authController;
