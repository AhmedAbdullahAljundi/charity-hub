/**
 * Arabic Messages for CharityHub
 * 
 * Centralized Arabic error and success messages
 */

const ARABIC_MESSAGES = {
  // Authentication
  AUTH_REQUIRED: 'يجب تسجيل الدخول للوصول إلى هذا المورد',
  AUTH_INVALID_TOKEN: 'رمز الدخول غير صالح',
  AUTH_TOKEN_EXPIRED: 'انتهت صلاحية رمز الدخول',
  AUTH_INVALID_CREDENTIALS: 'بيانات الدخول غير صحيحة',
  
  // Authorization
  FORBIDDEN_ACCESS: 'ليس لديك صلاحية للوصول إلى هذا المورد',
  PERMISSION_DENIED: 'ليس لديك الصلاحية المطلوبة',
  ROLE_NOT_FOUND: 'الدور غير موجود',
  PERMISSION_NOT_FOUND: 'الصلاحية غير موجودة',
  
  // Validation
  VALIDATION_ERROR: 'خطأ في التحقق من البيانات المدخلة',
  REQUIRED_FIELD: 'هذا الحقل مطلوب',
  INVALID_FORMAT: 'تنسيق غير صحيح',
  
  // General
  NOT_FOUND: 'المورد غير موجود',
  INTERNAL_ERROR: 'حدث خطأ داخلي',
  SUCCESS: 'تمت العملية بنجاح',
  
  // RBAC
  ROLE_CREATED: 'تم إنشاء الدور بنجاح',
  PERMISSION_CREATED: 'تم إنشاء الصلاحية بنجاح',
  USER_ROLE_UPDATED: 'تم تحديث دور المستخدم بنجاح',
};

/**
 * Get Arabic message by key
 * @param {string} key - Message key
 * @param {Object} replacements - Object with replacement values
 * @returns {string} Arabic message
 */
function getArabicMessage(key, replacements = {}) {
  let message = ARABIC_MESSAGES[key] || key;
  
  // Replace placeholders
  Object.keys(replacements).forEach((placeholder) => {
    const regex = new RegExp(`\\{${placeholder}\\}`, 'g');
    message = message.replace(regex, replacements[placeholder]);
  });
  
  return message;
}

module.exports = {
  ARABIC_MESSAGES,
  getArabicMessage,
};
