const { importHouseholds } = require('./import.service');

module.exports = {
  importExcel: async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'لم يتم رفع أي ملف' });
      }
      const results = await importHouseholds(req.file.buffer, req.user.userId);
      res.json({ success: true, data: results });
    } catch (e) {
      next(e);
    }
  },
};
