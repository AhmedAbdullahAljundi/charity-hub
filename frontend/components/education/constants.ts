export const STUDENT_LEVELS = [
  { value: "NONE", label: "لا يتعلم", hasGrade: false },
  { value: "KINDERGARTEN", label: "حضانة", hasGrade: false },
  { value: "PRIMARY", label: "ابتدائي", hasGrade: true, maxGrade: 6 },
  { value: "PREPARATORY", label: "إعدادي", hasGrade: true, maxGrade: 3 },
  { value: "SECONDARY_GENERAL", label: "ثانوي عام", hasGrade: true, maxGrade: 3 },
  { value: "SECONDARY_INDUSTRIAL_COMMERCIAL_BOYS", label: "ثانوي صناعي أو تجاري بنين", hasGrade: true, maxGrade: 3 },
  { value: "SECONDARY_INDUSTRIAL_COMMERCIAL_GIRLS", label: "ثانوي صناعي أو تجاري بنات", hasGrade: true, maxGrade: 3 },
  { value: "UNIVERSITY_SCIENTIFIC", label: "جامعي علمي (عملي)", hasGrade: true, maxGrade: 5 },
  { value: "UNIVERSITY_THEORETICAL", label: "جامعي نظري", hasGrade: true, maxGrade: 4 },
];

export const QURAN_SURAHS = [
  "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس",
  "هود", "يوسف", "الرعد", "إبراهيم", "الحجر", "النحل", "الإسراء", "الكهف", "مريم", "طه",
  "الأنبياء", "الحج", "المؤمنون", "النور", "الفرقان", "الشعراء", "النمل", "القصص", "العنكبوت", "الروم",
  "لقمان", "السجدة", "الأحزاب", "سبأ", "فاطر", "يس", "الصافات", "ص", "الزمر", "غافر",
  "فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية", "الأحقاف", "محمد", "الفتح", "الحجرات", "ق",
  "الذاريات", "الطور", "النجم", "القمر", "الرحمن", "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة",
  "الصف", "الجمعة", "المنافقون", "التغابن", "الطلاق", "التحريم", "الملك", "القلم", "الحاقة", "المعارج",
  "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات", "النبأ", "النازعات", "عبس",
  "التكوير", "الانفطار", "المطففين", "الانشقاق", "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد",
  "الشمس", "الليل", "الضحى", "الشرح", "التين", "العلق", "القدر", "البينة", "الزلزلة", "العاديات",
  "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون", "النصر",
  "المسد", "الإخلاص", "الفلق", "الناس"
];

export const QURAN_INSTITUTES = [
  { value: "IBN_MASOOD", label: "عبدالله بن مسعود" },
  { value: "UQBA_BIN_AAMER", label: "عقبة بن عامر" },
  { value: "DESOUKI_MOSQUE", label: "مسجد الدسوقي" },
  { value: "SHARIA_SOCIETY", label: "الجمعية الشرعية" },
  { value: "IQRAA", label: "اقرأ" },
];
