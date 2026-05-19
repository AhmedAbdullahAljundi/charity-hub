const scoringService = require('../scoring/scoring.service');

const familiesHelpers = {
  // Helper to recalculate and persist the score in the database
  recalculateAndSaveScore: async (familyId) => {
    return scoringService.calculateAndPersist(familyId);
  },

  // Helper mappings for frontend to backend enums
  mapRole: (role) => {
    const map = {
      'رب الأسرة': 'HUSBAND',
      'الزوجة': 'WIFE',
      'ابن': 'CHILD',
      'ابنة': 'CHILD'
    }
    return map[role] || 'OTHER'
  },

  mapEducation: (level) => {
    if (!level) return 'NONE'
    if (level.includes('ابتدائي')) return 'PRIMARY'
    if (level.includes('إعدادي')) return 'PREPARATORY'
    if (level.includes('ثانوي') || level.includes('دبلوم')) return 'SECONDARY'
    if (level.includes('جامعي') || level.includes('دراسات')) return 'UNIVERSITY'
    if (level.includes('حضانة')) return 'NURSERY'
    return 'NONE'
  },

  mapMaritalStatus: (status) => {
    const map = {
      'متزوج': 'MARRIED',
      'متزوجة': 'MARRIED',
      'أعزب': 'SINGLE',
      'آنسة': 'SINGLE',
      'مطلق': 'DIVORCED',
      'مطلقة': 'DIVORCED',
      'أرمل': 'WIDOWED',
      'أرملة': 'WIDOWED'
    }
    return map[status] || 'SINGLE'
  },

  mapIncomeSource: (source) => {
    const map = {
      'راتب ثابت': 'SALARY',
      'عمل يومي': 'SALARY',
      'عمل حر': 'SALARY',
      'معاش تأميني': 'PENSION',
      'تكافل وكرامة': 'TAKAFUL_KARAMA',
      'نفقة': 'NAFAKA',
      'مساعدات أهالي 1': 'FAMILY_SUPPORT',
      'مساعدات أهالي 2': 'FAMILY_SUPPORT',
      'مساعدات أهالي 3': 'FAMILY_SUPPORT',
      'مساعدات جمعية خيرية 1': 'CHARITY',
      'مساعدات جمعية خيرية 2': 'CHARITY',
      'بطاقة التموين': 'RATION_CARD',
      'دخل من مشاريع': 'PROJECT',
      'دخل من عقارات': 'PROPERTY',
      'شهريات الأبناء العاملين': 'CHILDREN_INCOME',
    }
    return map[source] || 'OTHER'
  },

  mapSeverity(severity) {
    if (!severity) return null;
    const text = severity.toString().trim();
    if (text.includes('خفيف') || text.includes('أ') || text.includes('A')) return 'MILD';
    if (text.includes('متوسط') || text.includes('ب') || text.includes('B')) return 'MODERATE';
    if (text.includes('شديد') || text.includes('ج') || text.includes('C')) return 'SEVERE';
    if (text.includes('حرج') || text.includes('متقدم') || text.includes('د') || text.includes('D')) return 'CRITICAL';
    return null;
  },

  mapDisabilityClass(code) {
    if (!code) return null;
    const text = code.toString().trim().toUpperCase();
    if (text.includes('أ') || text.includes('A')) return 'A';
    if (text.includes('ب') || text.includes('B')) return 'B';
    if (text.includes('ج') || text.includes('C')) return 'C';
    if (text.includes('د') || text.includes('D')) return 'D';
    return null;
  }
};

module.exports = familiesHelpers;
