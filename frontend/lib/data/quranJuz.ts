export interface QuranJuz {
  juzNumber: number;
  name: string;
  startSurah: string;
  endSurah: string;
  progressPercent: number;
}

export interface QuranSurah {
  id: number;
  name: string;
}

export const QURAN_JUZ: QuranJuz[] = [
  { juzNumber: 1, name: "الجزء الأول", startSurah: "الفاتحة", endSurah: "البقرة 141", progressPercent: 3.33 },
  { juzNumber: 2, name: "الجزء الثاني", startSurah: "البقرة 142", endSurah: "البقرة 252", progressPercent: 6.67 },
  { juzNumber: 3, name: "الجزء الثالث", startSurah: "البقرة 253", endSurah: "آل عمران 92", progressPercent: 10 },
  { juzNumber: 4, name: "الجزء الرابع", startSurah: "آل عمران 93", endSurah: "النساء 23", progressPercent: 13.33 },
  { juzNumber: 5, name: "الجزء الخامس", startSurah: "النساء 24", endSurah: "النساء 147", progressPercent: 16.67 },
  { juzNumber: 6, name: "الجزء السادس", startSurah: "النساء 148", endSurah: "المائدة 81", progressPercent: 20 },
  { juzNumber: 7, name: "الجزء السابع", startSurah: "المائدة 82", endSurah: "الأنعام 110", progressPercent: 23.33 },
  { juzNumber: 8, name: "الجزء الثامن", startSurah: "الأنعام 111", endSurah: "الأعراف 87", progressPercent: 26.67 },
  { juzNumber: 9, name: "الجزء التاسع", startSurah: "الأعراف 88", endSurah: "الأنفال 40", progressPercent: 30 },
  { juzNumber: 10, name: "الجزء العاشر", startSurah: "الأنفال 41", endSurah: "التوبة 92", progressPercent: 33.33 },
  { juzNumber: 11, name: "الجزء الحادي عشر", startSurah: "التوبة 93", endSurah: "هود 5", progressPercent: 36.67 },
  { juzNumber: 12, name: "الجزء الثاني عشر", startSurah: "هود 6", endSurah: "يوسف 52", progressPercent: 40 },
  { juzNumber: 13, name: "الجزء الثالث عشر", startSurah: "يوسف 53", endSurah: "إبراهيم 52", progressPercent: 43.33 },
  { juzNumber: 14, name: "الجزء الرابع عشر", startSurah: "الحجر", endSurah: "النحل 128", progressPercent: 46.67 },
  { juzNumber: 15, name: "الجزء الخامس عشر", startSurah: "الإسراء", endSurah: "الكهف 74", progressPercent: 50 },
  { juzNumber: 16, name: "الجزء السادس عشر", startSurah: "الكهف 75", endSurah: "طه 135", progressPercent: 53.33 },
  { juzNumber: 17, name: "الجزء السابع عشر", startSurah: "الأنبياء", endSurah: "الحج 78", progressPercent: 56.67 },
  { juzNumber: 18, name: "الجزء الثامن عشر", startSurah: "المؤمنون", endSurah: "الفرقان 20", progressPercent: 60 },
  { juzNumber: 19, name: "الجزء التاسع عشر", startSurah: "الفرقان 21", endSurah: "النمل 55", progressPercent: 63.33 },
  { juzNumber: 20, name: "الجزء العشرون", startSurah: "النمل 56", endSurah: "العنكبوت 45", progressPercent: 66.67 },
  { juzNumber: 21, name: "الجزء الحادي والعشرون", startSurah: "العنكبوت 46", endSurah: "الأحزاب 30", progressPercent: 70 },
  { juzNumber: 22, name: "الجزء الثاني والعشرون", startSurah: "الأحزاب 31", endSurah: "يس 27", progressPercent: 73.33 },
  { juzNumber: 23, name: "الجزء الثالث والعشرون", startSurah: "يس 28", endSurah: "الزمر 31", progressPercent: 76.67 },
  { juzNumber: 24, name: "الجزء الرابع والعشرون", startSurah: "الزمر 32", endSurah: "فصلت 46", progressPercent: 80 },
  { juzNumber: 25, name: "الجزء الخامس والعشرون", startSurah: "فصلت 47", endSurah: "الجاثية 37", progressPercent: 83.33 },
  { juzNumber: 26, name: "الجزء السادس والعشرون", startSurah: "الأحقاف", endSurah: "الذاريات 30", progressPercent: 86.67 },
  { juzNumber: 27, name: "الجزء السابع والعشرون", startSurah: "الذاريات 31", endSurah: "الحديد 29", progressPercent: 90 },
  { juzNumber: 28, name: "الجزء الثامن والعشرون", startSurah: "المجادلة", endSurah: "التحريم 12", progressPercent: 93.33 },
  { juzNumber: 29, name: "جزء تبارك", startSurah: "الملك", endSurah: "المرسلات 50", progressPercent: 96.67 },
  { juzNumber: 30, name: "جزء عم", startSurah: "النبأ", endSurah: "الناس", progressPercent: 100 },
];

export const QURAN_SURAHS: QuranSurah[] = [
  { id: 1, name: "الفاتحة" },
  { id: 2, name: "البقرة" },
  { id: 3, name: "آل عمران" },
  { id: 4, name: "النساء" },
  { id: 5, name: "المائدة" },
  { id: 6, name: "الأنعام" },
  { id: 7, name: "الأعراف" },
  { id: 8, name: "الأنفال" },
  { id: 9, name: "التوبة" },
  { id: 10, name: "يونس" },
  { id: 11, name: "هود" },
  { id: 12, name: "يوسف" },
  { id: 13, name: "الرعد" },
  { id: 14, name: "إبراهيم" },
  { id: 15, name: "الحجر" },
  { id: 16, name: "النحل" },
  { id: 17, name: "الإسراء" },
  { id: 18, name: "الكهف" },
  { id: 19, name: "مريم" },
  { id: 20, name: "طه" },
  { id: 21, name: "الأنبياء" },
  { id: 22, name: "الحج" },
  { id: 23, name: "المؤمنون" },
  { id: 24, name: "النور" },
  { id: 25, name: "الفرقان" },
  { id: 26, name: "الشعراء" },
  { id: 27, name: "النمل" },
  { id: 28, name: "القصص" },
  { id: 29, name: "العنكبوت" },
  { id: 30, name: "الروم" },
  { id: 31, name: "لقمان" },
  { id: 32, name: "السجدة" },
  { id: 33, name: "الأحزاب" },
  { id: 34, name: "سبأ" },
  { id: 35, name: "فاطر" },
  { id: 36, name: "يس" },
  { id: 37, name: "الصافات" },
  { id: 38, name: "ص" },
  { id: 39, name: "الزمر" },
  { id: 40, name: "غافر" },
  { id: 41, name: "فصلت" },
  { id: 42, name: "الشورى" },
  { id: 43, name: "الزخرف" },
  { id: 44, name: "الدخان" },
  { id: 45, name: "الجاثية" },
  { id: 46, name: "الأحقاف" },
  { id: 47, name: "محمد" },
  { id: 48, name: "الفتح" },
  { id: 49, name: "الحجرات" },
  { id: 50, name: "ق" },
  { id: 51, name: "الذاريات" },
  { id: 52, name: "الطور" },
  { id: 53, name: "النجم" },
  { id: 54, name: "القمر" },
  { id: 55, name: "الرحمن" },
  { id: 56, name: "الواقعة" },
  { id: 57, name: "الحديد" },
  { id: 58, name: "المجادلة" },
  { id: 59, name: "الحشر" },
  { id: 60, name: "الممتحنة" },
  { id: 61, name: "الصف" },
  { id: 62, name: "الجمعة" },
  { id: 63, name: "المنافقون" },
  { id: 64, name: "التغابن" },
  { id: 65, name: "الطلاق" },
  { id: 66, name: "التحريم" },
  { id: 67, name: "الملك" },
  { id: 68, name: "القلم" },
  { id: 69, name: "الحاقة" },
  { id: 70, name: "المعارج" },
  { id: 71, name: "نوح" },
  { id: 72, name: "الجن" },
  { id: 73, name: "المزمل" },
  { id: 74, name: "المدثر" },
  { id: 75, name: "القيامة" },
  { id: 76, name: "الإنسان" },
  { id: 77, name: "المرسلات" },
  { id: 78, name: "النبأ" },
  { id: 79, name: "النازعات" },
  { id: 80, name: "عبس" },
  { id: 81, name: "التكوير" },
  { id: 82, name: "الانفطار" },
  { id: 83, name: "المطففين" },
  { id: 84, name: "الانشقاق" },
  { id: 85, name: "البروج" },
  { id: 86, name: "الطارق" },
  { id: 87, name: "الأعلى" },
  { id: 88, name: "الغاشية" },
  { id: 89, name: "الفجر" },
  { id: 90, name: "البلد" },
  { id: 91, name: "الشمس" },
  { id: 92, name: "الليل" },
  { id: 93, name: "الضحى" },
  { id: 94, name: "الشرح" },
  { id: 95, name: "التين" },
  { id: 96, name: "العلق" },
  { id: 97, name: "القدر" },
  { id: 98, name: "البينة" },
  { id: 99, name: "الزلزلة" },
  { id: 100, name: "العاديات" },
  { id: 101, name: "القارعة" },
  { id: 102, name: "التكاثر" },
  { id: 103, name: "العصر" },
  { id: 104, name: "الهمزة" },
  { id: 105, name: "الفيل" },
  { id: 106, name: "قريش" },
  { id: 107, name: "الماعون" },
  { id: 108, name: "الكوثر" },
  { id: 109, name: "الكافرون" },
  { id: 110, name: "النصر" },
  { id: 111, name: "المسد" },
  { id: 112, name: "الإخلاص" },
  { id: 113, name: "الفلق" },
  { id: 114, name: "الناس" },
];

/**
 * Calculate Quran memorization progress percentage based on juz count.
 * @param juzCount - Number of juz memorized (0-30)
 * @returns Progress percentage rounded to 2 decimal places
 */
export function getQuranProgress(juzCount: number): number {
  const clamped = Math.max(0, Math.min(30, juzCount));
  return Math.round((clamped / 30) * 10000) / 100;
}

/**
 * Filter surahs by search query — matches names that start with or contain the query.
 * @param query - Search string to filter surahs by
 * @returns Filtered array of QuranSurah
 */
export function filterSurahs(query: string): QuranSurah[] {
  if (!query.trim()) return QURAN_SURAHS;
  const q = query.trim();
  return QURAN_SURAHS.filter(
    (s) => s.name.startsWith(q) || s.name.includes(q)
  );
}
