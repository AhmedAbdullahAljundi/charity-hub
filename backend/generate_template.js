const ExcelJS = require('exceljs');
const path = require('path');

async function generateTemplate() {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'CharityHub';
  wb.lastModifiedBy = 'CharityHub';
  wb.created = new Date();

  // ── Helper to format headers ──
  const formatHeader = (sheet) => {
    const row = sheet.getRow(1);
    row.font = { name: 'Arial', family: 4, size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
    row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } }; // Green
    row.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    row.height = 30;
    
    // Auto fit columns based on header length with some padding
    sheet.columns.forEach(col => {
      if (col.header) {
        col.width = Math.max(15, col.header.length * 1.5);
      }
    });
  };

  // ── Helper to add Data Validation ──
  // ExcelJS needs string arrays joined by comma for list formulas
  const addValidation = (sheet, colIndex, formulaArray, promptTitle = 'اختر من القائمة', promptMessage = 'الرجاء اختيار قيمة من القائمة المنسدلة.') => {
    // Apply validation to rows 2 to 1000
    for (let i = 2; i <= 1000; i++) {
      sheet.getCell(i, colIndex).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [`"${formulaArray.join(',')}"`],
        showInputMessage: true,
        showErrorMessage: true,
        promptTitle,
        promptMessage,
        errorTitle: 'قيمة غير صالحة',
        error: 'الرجاء اختيار إحدى القيم المحددة في القائمة.'
      };
    }
  };

  const YESNO = ['نعم', 'لا'];

  // ════ SHEET 1: الأسر ════════════════════════════════════════════════
  const ws1 = wb.addWorksheet('الأسر', { views: [{ rightToLeft: true }] });
  ws1.columns = [
    { header: 'رقم القيد الخارجي *', key: 'extId' },
    { header: 'اسم الأسرة *', key: 'familyName' },
    { header: 'المحافظة *', key: 'gov' },
    { header: 'المركز/المديرية *', key: 'district' },
    { header: 'القرية/الحي *', key: 'village' },
    { header: 'العنوان التفصيلي *', key: 'address' },
    { header: 'الهاتف الأساسي *', key: 'phone1' },
    { header: 'هاتف احتياطي', key: 'phone2' },
    { header: 'واتساب', key: 'whatsapp' },
    { header: 'الحالة الاجتماعية *', key: 'social' },
    { header: 'نوع المسكن *', key: 'housing' },
    { header: 'كارت التموين *', key: 'ration' },
    { header: 'دعم الأسرة', key: 'support' },
    { header: 'مساعدة غذائية', key: 'food' },
    { header: 'درجة الأصول/الثروة', key: 'wealth' },
    { header: 'ملاحظات ميدانية', key: 'notes' },
    { header: 'رابط ملف PDF', key: 'pdf' },
  ];
  formatHeader(ws1);

  addValidation(ws1, 10, ['MARRIED', 'DIVORCED', 'WIDOWED', 'WIDOWED_MARRIED', 'SINGLE', 'SINGLE_OTHER']);
  addValidation(ws1, 11, ['OWNED', 'RENTED', 'SHARED', 'INFORMAL', 'RELATIVE']);
  addValidation(ws1, 12, YESNO);
  addValidation(ws1, 13, YESNO);
  addValidation(ws1, 14, YESNO);
  addValidation(ws1, 15, ['A', 'B', 'C', 'D', 'E', 'F', 'NONE']);


  // ════ SHEET 2: الأفراد ══════════════════════════════════════════════
  const ws2 = wb.addWorksheet('الأفراد', { views: [{ rightToLeft: true }] });
  ws2.columns = [
    { header: 'رقم القيد الخارجي *', key: 'extId' },
    { header: 'الاسم الكامل *', key: 'fullName' },
    { header: 'الرقم القومي', key: 'nid' },
    { header: 'الجنس *', key: 'gender' },
    { header: 'تاريخ الميلاد *', key: 'dob' },
    { header: 'الدور في الأسرة *', key: 'role' },
    { header: 'الحالة الاجتماعية', key: 'social' },
    { header: 'حالة الإقامة', key: 'residency' },
    { header: 'يتيم', key: 'orphan' },
    { header: 'مشرد', key: 'displaced' },
    { header: 'عروسة', key: 'bride' },
    { header: 'طالب', key: 'student' },
    { header: 'مساهم في الدخل', key: 'contributor' },
  ];
  formatHeader(ws2);

  addValidation(ws2, 4, ['MALE', 'FEMALE']);
  addValidation(ws2, 6, ['HEAD', 'SPOUSE', 'CHILD', 'DEPENDENT_ADULT', 'INDEPENDENT', 'OTHER']);
  addValidation(ws2, 7, ['MARRIED', 'DIVORCED', 'WIDOWED', 'WIDOWED_MARRIED', 'SINGLE', 'SINGLE_OTHER']);
  addValidation(ws2, 8, ['RESIDENT', 'ABSENT_DEATH', 'ABSENT_PRISON', 'ABSENT_DIVORCE', 'ABSENT_OTHER']);
  addValidation(ws2, 9, YESNO);
  addValidation(ws2, 10, YESNO);
  addValidation(ws2, 11, YESNO);
  addValidation(ws2, 12, YESNO);
  addValidation(ws2, 13, YESNO);

  // Note for DOB
  for (let i = 2; i <= 1000; i++) {
    ws2.getCell(i, 5).dataValidation = {
      type: 'date',
      allowBlank: true,
      operator: 'lessThan',
      showErrorMessage: true,
      formulae: [new Date()],
      errorTitle: 'تاريخ غير صالح',
      error: 'يجب أن يكون تاريخ الميلاد بتنسيق صحيح وأقل من تاريخ اليوم.',
      promptTitle: 'تاريخ الميلاد',
      promptMessage: 'أدخل التاريخ بصيغة YYYY-MM-DD'
    };
  }


  // ════ SHEET 3: مصادر الدخل ══════════════════════════════════════════
  const ws3 = wb.addWorksheet('مصادر الدخل', { views: [{ rightToLeft: true }] });
  ws3.columns = [
    { header: 'رقم القيد الخارجي *', key: 'extId' },
    { header: 'قناة الدخل *', key: 'channel' },
    { header: 'المبلغ الشهري *', key: 'amount' },
    { header: 'حالة التوثيق *', key: 'verif' },
  ];
  formatHeader(ws3);

  addValidation(ws3, 2, ['SALARY', 'PENSION', 'ALIMONY', 'CHARITY', 'FARMING', 'TRADE', 'FREELANCE', 'RENT', 'OTHER']);
  addValidation(ws3, 4, ['UNVERIFIED', 'SELF_REPORTED', 'DOCUMENT', 'OFFICIAL']);

  for (let i = 2; i <= 1000; i++) {
    ws3.getCell(i, 3).dataValidation = {
      type: 'decimal',
      operator: 'greaterThanOrEqual',
      formulae: [0],
      showErrorMessage: true,
      errorTitle: 'مبلغ غير صالح',
      error: 'المبلغ يجب أن يكون رقماً موجباً.'
    };
  }


  // ════ SHEET 4: الأمراض والإعاقات ════════════════════════════════════
  const ws4 = wb.addWorksheet('الأمراض والإعاقات', { views: [{ rightToLeft: true }] });
  ws4.columns = [
    { header: 'الأمراض والإعاقات - رقم القيد الخارجي *', key: 'extId' },
    { header: 'الاسم', key: 'name' },
    { header: 'النوع', key: 'type' },
  ];
  formatHeader(ws4);


  // ════ SHEET 5: الأعباء المؤقتة ══════════════════════════════════════
  const ws5 = wb.addWorksheet('الأعباء المؤقتة', { views: [{ rightToLeft: true }] });
  ws5.columns = [
    { header: 'رقم القيد الخارجي *', key: 'extId' },
    { header: 'تصنيف العبء *', key: 'type' },
    { header: 'درجة الشدة', key: 'grade' },
    { header: 'المبلغ/التفاصيل', key: 'details' },
    { header: 'ملاحظة', key: 'notes' },
  ];
  formatHeader(ws5);

  addValidation(ws5, 2, ['ديون', 'إصابة', 'عملية جراحية', 'تجهيز عروس', 'ابن في السجن']);
  addValidation(ws5, 3, ['A', 'B', 'C', 'D', 'E', 'F']);


  // ════ Save to File ════════════════════════════════════════════════
  const outputPath = path.join(__dirname, '../frontend/public/CharityHub_Import_Template_v2.xlsx');
  await wb.xlsx.writeFile(outputPath);
  console.log('Template generated at:', outputPath);
}

generateTemplate().catch(console.error);
