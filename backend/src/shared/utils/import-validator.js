const EGYPTIAN_NID = /^([23])(\d{2})(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{7}$/;

// Map Arabic Excel values → Prisma enum values
const SOCIAL_STATUS_MAP = {
  'MARRIED': 'MARRIED', 'DIVORCED': 'DIVORCED',
  'WIDOWED': 'WIDOWED', 'WIDOWED_MARRIED': 'WIDOWED_MARRIED',
  'SINGLE': 'SINGLE', 'SINGLE_OTHER': 'SINGLE_OTHER',
};

const HOUSING_MAP = {
  'OWNED': 'OWNED', 'RENTED': 'RENTED', 'SHARED': 'SHARED',
  'INFORMAL': 'SHARED', 'RELATIVE': 'DONATED_RENT',
};

const ROLE_MAP = {
  'HEAD': 'HEAD', 'SPOUSE': 'SPOUSE', 'CHILD': 'CHILD',
  'DEPENDENT_ADULT': 'DEPENDENT_ADULT', 'INDEPENDENT': 'INDEPENDENT', 'OTHER': 'OTHER',
};

const GENDER_MAP   = { 'MALE': 'MALE', 'FEMALE': 'FEMALE' };

const RESIDENCY_MAP = {
  'RESIDENT': 'RESIDENT', 'ABSENT_DEATH': 'ABSENT_DEATH',
  'ABSENT_PRISON': 'ABSENT_PRISON', 'ABSENT_DIVORCE': 'ABSENT_DIVORCE',
  'ABSENT_OTHER': 'ABSENT_OTHER',
};

const SEVERITY_MAP  = { 'NONE': 'NONE', 'MILD': 'MILD', 'MODERATE': 'MODERATE', 'SEVERE': 'SEVERE' };

const GRADE_MAP = { 'A': 'A', 'B': 'B', 'C': 'C', 'D': 'D', 'E': 'E', 'F': 'F' };

const BURDEN_TYPE_MAP = {
  'ديون': 'DEBT', 'إصابة': 'INJURY', 'عملية جراحية': 'SURGERY',
  'تجهيز عروس': 'BRIDE', 'ابن في السجن': 'SON_IN_PRISON'
};

// Mapped loosely to the nearest available Prisma enum `IncomeChannel`
const CHANNEL_MAP = {
  'SALARY': 'DONOR_1', 'PENSION': 'PENSION', 'ALIMONY': 'ALIMONY',
  'CHARITY': 'CHARITY_1', 'FARMING': 'DONOR_2', 'TRADE': 'DONOR_2',
  'FREELANCE': 'DONOR_2', 'RENT': 'DONOR_2', 'OTHER': 'DONOR_2',
};

const VERIF_MAP = {
  'UNVERIFIED': 'UNVERIFIED', 'SELF_REPORTED': 'PENDING',
  'DOCUMENT': 'VERIFIED', 'OFFICIAL': 'VERIFIED',
};

const YESNO = (v) => v === 'نعم' || v === 'true' || v === true || v === '1';

function requireField(obj, field, label, errors) {
  if (!obj[field] || String(obj[field]).trim() === '') {
    errors.push(`الحقل "${label}" مطلوب`);
    return false;
  }
  return true;
}

function validateHousehold(row) {
  const errors = [];
  const r = (f, l) => requireField(row, f, l, errors);

  r('رقم القيد الخارجي *',  'رقم القيد الخارجي');
  r('اسم الأسرة *',         'اسم الأسرة');
  r('المحافظة *',            'المحافظة');
  r('المركز/المديرية *',     'المركز');
  r('القرية/الحي *',         'القرية');
  r('العنوان التفصيلي *',    'العنوان التفصيلي');
  r('الهاتف الأساسي *',      'الهاتف الأساسي');

  const ht = row['نوع المسكن *'];
  if (ht && !HOUSING_MAP[ht])
    errors.push(`نوع المسكن "${ht}" غير صالح`);

  return errors;
}

function validatePerson(row) {
  const errors = [];
  const r = (f, l) => requireField(row, f, l, errors);

  r('رقم القيد الخارجي *', 'رقم القيد الخارجي');
  r('الاسم الكامل *',       'الاسم الكامل');
  r('الجنس *',               'الجنس');
  r('تاريخ الميلاد *',       'تاريخ الميلاد');
  r('الدور في الأسرة *',     'الدور في الأسرة');

  const nid = row['الرقم القومي'];
  if (nid && !EGYPTIAN_NID.test(String(nid).trim()))
    errors.push(`الرقم القومي "${nid}" غير صالح`);

  if (!GENDER_MAP[row['الجنس *']])
    errors.push(`الجنس "${row['الجنس *']}" غير صالح`);

  if (!ROLE_MAP[row['الدور في الأسرة *']])
    errors.push(`الدور "${row['الدور في الأسرة *']}" غير صالح`);

  const bd = row['تاريخ الميلاد *'];
  if (bd && isNaN(new Date(bd).getTime()))
    errors.push(`تاريخ الميلاد "${bd}" غير صالح — استخدم YYYY-MM-DD`);

  return errors;
}

function validateIncomeSource(row) {
  const errors = [];
  requireField(row, 'رقم القيد الخارجي *', 'رقم القيد الخارجي', errors);
  requireField(row, 'قناة الدخل *',        'قناة الدخل', errors);
  requireField(row, 'المبلغ الشهري *',      'المبلغ الشهري', errors);

  const ch = row['قناة الدخل *'];
  if (ch && !CHANNEL_MAP[ch]) errors.push(`قناة الدخل "${ch}" غير صالحة`);

  const amt = parseFloat(row['المبلغ الشهري *']);
  if (isNaN(amt) || amt < 0) errors.push('المبلغ الشهري يجب أن يكون رقماً موجباً');

  return errors;
}

module.exports = {
  validateHousehold, validatePerson, validateIncomeSource,
  SOCIAL_STATUS_MAP, HOUSING_MAP, ROLE_MAP, GENDER_MAP,
  RESIDENCY_MAP, SEVERITY_MAP, CHANNEL_MAP, VERIF_MAP, YESNO,
  GRADE_MAP, BURDEN_TYPE_MAP
};
