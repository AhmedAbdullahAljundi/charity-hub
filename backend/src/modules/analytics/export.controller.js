const exportService = require('./export.service');

const exportController = {
  async downloadPreset(req, res, next) {
    try {
      const { type } = req.params;
      const { startDate, endDate } = req.query;
      let buffer;
      let filename = `${type}_report.xlsx`;

      switch (type) {
        case 'comprehensive':
          buffer = await exportService.comprehensive();
          filename = 'Comprehensive_Report.xlsx';
          break;
        case 'financial':
          buffer = await exportService.financial({ startDate, endDate });
          filename = 'Financial_Report.xlsx';
          break;
        case 'periodic':
          buffer = await exportService.periodic({ startDate, endDate });
          filename = 'Periodic_Disbursements.xlsx';
          break;
        case 'operations':
          buffer = await exportService.operations();
          filename = 'Operations_Medical.xlsx';
          break;
        case 'educational':
          buffer = await exportService.educational();
          filename = 'Educational_Report.xlsx';
          break;
        default:
          return res.status(400).json({ success: false, message: 'نوع التقرير غير مدعوم' });
      }

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      res.send(buffer);
    } catch (e) {
      next(e);
    }
  },

  async downloadCustom(req, res, next) {
    try {
      const { entity, columns, filter } = req.body;
      if (!entity || !columns || !Array.isArray(columns) || columns.length === 0) {
        return res.status(400).json({ success: false, message: 'بيانات التخصيص غير مكتملة' });
      }

      const buffer = await exportService.custom({ entity, columns, filter });
      
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=Custom_Report.xlsx`);
      res.send(buffer);
    } catch (e) {
      next(e);
    }
  }
};

module.exports = exportController;
