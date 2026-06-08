const ExcelJS = require('exceljs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const exportService = {
  // ── Helper ───────────────────────────────────────────
  async createBuffer(sheetName, columns, data) {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet(sheetName, { views: [{ rightToLeft: true }] });

    ws.columns = columns.map(c => ({
      header: c.header,
      key: c.key,
      width: Math.max(15, c.header.length * 2)
    }));

    // Header styling
    const headerRow = ws.getRow(1);
    headerRow.font = { name: 'Arial', bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 30;

    data.forEach(item => {
      ws.addRow(item);
    });

    return await wb.xlsx.writeBuffer();
  },

  // ── Preset 1: Comprehensive (الشامل) ──────────────────
  async comprehensive() {
    const households = await prisma.household.findMany({
      where: { isDraft: false },
      include: {
        persons: true,
        scoreResults: { orderBy: { calculatedAt: 'desc' }, take: 1 }
      }
    });

    const data = households.map(h => {
      const score = h.scoreResults[0];
      return {
        code: h.code,
        familyName: h.familyName,
        gov: h.governorate,
        district: h.district,
        village: h.village,
        phone: h.primaryPhone,
        membersCount: h.persons.length,
        housingType: h.housingType,
        assets: h.bankAssetGrade,
        score: score ? parseFloat(score.normalizedPercent).toFixed(2) + '%' : 'N/A',
        recommendation: score ? score.systemRecommendation : 'N/A',
      };
    });

    return this.createBuffer('التقرير الشامل', [
      { header: 'رقم القيد', key: 'code' },
      { header: 'اسم الأسرة', key: 'familyName' },
      { header: 'المحافظة', key: 'gov' },
      { header: 'المركز', key: 'district' },
      { header: 'القرية', key: 'village' },
      { header: 'الهاتف', key: 'phone' },
      { header: 'عدد الأفراد', key: 'membersCount' },
      { header: 'السكن', key: 'housingType' },
      { header: 'درجة الثروة', key: 'assets' },
      { header: 'التقييم %', key: 'score' },
      { header: 'توصية النظام', key: 'recommendation' },
    ], data);
  },

  // ── Preset 2: Financial (المالي) ──────────────────────
  async financial({ startDate, endDate } = {}) {
    // Build date filter
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.calculatedAt = {};
      if (startDate) dateFilter.calculatedAt.gte = new Date(startDate);
      if (endDate) dateFilter.calculatedAt.lte = new Date(endDate);
    }

    const households = await prisma.household.findMany({
      where: { isDraft: false },
      include: {
        incomeSources: true,
        scoreResults: {
          orderBy: { calculatedAt: 'desc' },
          take: 1,
          where: dateFilter
        }
      }
    });

    const data = households.map(h => {
      const score = h.scoreResults[0];
      let monthlyIncome = 0;
      h.incomeSources.forEach(i => {
        monthlyIncome += parseFloat(i.monthlyAmount);
      });

      return {
        code: h.code,
        familyName: h.familyName,
        totalIncome: monthlyIncome,
        score: score ? parseFloat(score.normalizedPercent).toFixed(2) + '%' : 'N/A',
        recommendation: score ? score.systemRecommendation : 'N/A',
      };
    });

    return this.createBuffer('التقرير المالي', [
      { header: 'رقم القيد', key: 'code' },
      { header: 'اسم الأسرة', key: 'familyName' },
      { header: 'إجمالي الدخل الشهري', key: 'totalIncome' },
      { header: 'التقييم %', key: 'score' },
      { header: 'توصية النظام', key: 'recommendation' },
    ], data);
  },

  // ── Preset 3: Periodic (الدوري) ───────────────────────
  async periodic({ startDate, endDate } = {}) {
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.period = {};
      if (startDate) dateFilter.period.gte = new Date(startDate);
      if (endDate) dateFilter.period.lte = new Date(endDate);
    }

    const disbursements = await prisma.disbursementMonth.findMany({
      where: dateFilter,
      orderBy: { period: 'desc' },
      include: {
        payments: {
          include: { household: true }
        }
      }
    });

    const data = [];
    disbursements.forEach(d => {
      d.payments.forEach(p => {
        data.push({
          month: d.period.toISOString().slice(0, 7), // YYYY-MM
          status: d.status,
          code: p.household.code,
          familyName: p.household.familyName,
          category: p.category,
          amount: parseFloat(p.finalAmount || p.calculatedAmount || 0),
        });
      });
    });

    return this.createBuffer('التقرير الدوري', [
      { header: 'شهر الصرف', key: 'month' },
      { header: 'حالة الصرف', key: 'status' },
      { header: 'رقم القيد', key: 'code' },
      { header: 'اسم الأسرة', key: 'familyName' },
      { header: 'الفئة', key: 'category' },
      { header: 'المبلغ المستحق', key: 'amount' },
    ], data);
  },

  // ── Preset 4: Operations/Medical (العمليات) ──────────
  async operations() {
    const medicalCases = await prisma.medicalCase.findMany({
      include: {
        household: true,
        person: true,
        disbursements: true
      }
    });

    const data = medicalCases.map(m => {
      let totalDisbursed = 0;
      m.disbursements.forEach(d => {
        if (d.status === 'PAID') totalDisbursed += parseFloat(d.amount);
      });

      return {
        code: m.household.code,
        familyName: m.household.familyName,
        patientName: m.person.name,
        condition: m.conditionName,
        isCritical: m.isCritical ? 'نعم' : 'لا',
        isActive: m.isActive ? 'نعم' : 'لا',
        estimatedCost: parseFloat(m.estimatedMonthlyCost || 0),
        totalDisbursed,
      };
    });

    return this.createBuffer('العمليات والحالات الطبية', [
      { header: 'رقم القيد', key: 'code' },
      { header: 'الأسرة', key: 'familyName' },
      { header: 'اسم المريض', key: 'patientName' },
      { header: 'الحالة الطبية', key: 'condition' },
      { header: 'حرجة؟', key: 'isCritical' },
      { header: 'نشطة؟', key: 'isActive' },
      { header: 'التكلفة التقديرية', key: 'estimatedCost' },
      { header: 'إجمالي المنصرف', key: 'totalDisbursed' },
    ], data);
  },

  // ── Preset 5: Educational (التعليمي) ──────────────────
  async educational() {
    const records = await prisma.studentAcademicRecord.findMany({
      include: {
        person: true,
        household: true
      }
    });

    const data = records.map(r => ({
      code: r.household.code,
      studentName: r.person.name,
      year: r.academicYear,
      level: r.studentLevel,
      school: r.schoolName,
      average: r.averageScore ? parseFloat(r.averageScore) : 'N/A',
      quran: r.quranProgress ? parseFloat(r.quranProgress) + ' أجزاء' : 'N/A'
    }));

    return this.createBuffer('التقرير التعليمي', [
      { header: 'رقم القيد', key: 'code' },
      { header: 'اسم الطالب', key: 'studentName' },
      { header: 'العام الدراسي', key: 'year' },
      { header: 'المرحلة الدراسية', key: 'level' },
      { header: 'اسم المدرسة', key: 'school' },
      { header: 'متوسط الدرجات', key: 'average' },
      { header: 'حفظ القرآن', key: 'quran' },
    ], data);
  },

  // ── Custom Report ─────────────────────────────────────
  async custom({ entity, columns, filter }) {
    if (entity === 'households') {
      const fieldsToSelect = columns.reduce((acc, col) => { acc[col] = true; return acc; }, {});
      const records = await prisma.household.findMany({
        select: { ...fieldsToSelect, code: true } // always include code
      });
      return this.createBuffer('تقرير مخصص (أسر)', columns.map(c => ({ header: c, key: c })), records);
    }
    
    if (entity === 'persons') {
      const fieldsToSelect = columns.reduce((acc, col) => { acc[col] = true; return acc; }, {});
      const records = await prisma.person.findMany({
        select: { ...fieldsToSelect, name: true, household: { select: { code: true } } }
      });
      const data = records.map(r => ({ ...r, householdCode: r.household?.code }));
      const outputCols = [{ header: 'كود الأسرة', key: 'householdCode' }, ...columns.map(c => ({ header: c, key: c }))];
      return this.createBuffer('تقرير مخصص (أفراد)', outputCols, data);
    }

    throw new Error('Entity not supported');
  }
};

module.exports = exportService;
