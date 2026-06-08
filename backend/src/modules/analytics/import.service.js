const { PrismaClient, Decimal } = require('@prisma/client');
const prisma = new PrismaClient();
const { parseImportFile }    = require('../../shared/utils/excel-parser');
const {
  validateHousehold, validatePerson, validateIncomeSource,
  SOCIAL_STATUS_MAP, HOUSING_MAP, ROLE_MAP, GENDER_MAP,
  RESIDENCY_MAP, SEVERITY_MAP, CHANNEL_MAP, VERIF_MAP, YESNO,
  GRADE_MAP, BURDEN_TYPE_MAP
} = require('../../shared/utils/import-validator');

// Generate unique household code
async function generateCode() {
  const last = await prisma.household.findFirst({
    orderBy: { code: 'desc' },
    select: { code: true },
  });
  const next = last ? parseInt(last.code, 10) + 1 : 1;
  return String(next).padStart(4, '0');
}

async function importHouseholds(buffer, userId) {
  const parsed = parseImportFile(buffer);
  const { households, persons, incomeSources, healthRecords, burdens } = parsed;

  const results = {
    success: 0,
    failed: 0,
    errors: [],   // { sheet, row, externalId, messages: [] }
    created: [],  // { externalId, code, householdId }
  };

  // ── Group sub-records by external ID ──────────────────────────────────────
  const personsByExt       = groupBy(persons,       'رقم القيد الخارجي *');
  const incomeByExt        = groupBy(incomeSources, 'رقم القيد الخارجي *');
  const healthByExt        = groupBy(healthRecords, 'الأمراض والإعاقات - رقم القيد الخارجي *');
  const burdensByExt       = groupBy(burdens,       'رقم القيد الخارجي *');

  // ── Process each household row ────────────────────────────────────────────
  for (const hhRow of households) {
    const extId   = String(hhRow['رقم القيد الخارجي *'] ?? '').trim();
    const rowIdx  = hhRow._rowIndex;

    // 1) Validate household row
    const hhErrors = validateHousehold(hhRow);

    // 2) Validate its persons
    const personRows = personsByExt[extId] ?? [];
    const personErrors = [];
    for (const p of personRows) {
      const errs = validatePerson(p);
      if (errs.length) personErrors.push(...errs.map(e => `الأفراد سطر ${p._rowIndex}: ${e}`));
    }

    // 3) Validate income
    const incomeRows   = incomeByExt[extId] ?? [];
    const incomeErrors = [];
    for (const inc of incomeRows) {
      const errs = validateIncomeSource(inc);
      if (errs.length) incomeErrors.push(...errs.map(e => `مصادر الدخل سطر ${inc._rowIndex}: ${e}`));
    }

    const allErrors = [...hhErrors, ...personErrors, ...incomeErrors];
    if (allErrors.length) {
      results.failed++;
      results.errors.push({ sheet: 'الأسر', row: rowIdx, externalId: extId, messages: allErrors });
      continue;
    }

    // 4) Insert in a single transaction
    try {
      const code = await generateCode();

      await prisma.$transaction(async (tx) => {
        // ── Household ────────────────────────────────────────────────────
        const hh = await tx.household.create({
          data: {
            code,
            familyName:     String(hhRow['اسم الأسرة *']).trim(),
            governorate:    String(hhRow['المحافظة *']).trim(),
            district:       String(hhRow['المركز/المديرية *']).trim(),
            village:        String(hhRow['القرية/الحي *']).trim(),
            addressDetails: String(hhRow['العنوان التفصيلي *']).trim(),
            primaryPhone:   String(hhRow['الهاتف الأساسي *']).trim(),
            secondaryPhone: hhRow['هاتف احتياطي'] ?? null,
            whatsappPhone:  hhRow['واتساب'] ?? null,
            socialStatus:   SOCIAL_STATUS_MAP[hhRow['الحالة الاجتماعية *']] ?? null,
            housingType:    HOUSING_MAP[hhRow['نوع المسكن *']] ?? 'OWNED',
            hasRationCard:  YESNO(hhRow['كارت التموين *']),
            hasFamilySupport: YESNO(hhRow['دعم الأسرة']),
            hasFoodAid:     YESNO(hhRow['مساعدة غذائية']),
            bankAssetGrade: GRADE_MAP[hhRow['درجة الأصول/الثروة']] ?? null,
            fieldNotes:     hhRow['ملاحظات ميدانية'] ?? null,
            pdfUrl:         hhRow['رابط ملف PDF'] ?? null,
            isDraft:        false,
            createdById:    userId,
          },
        });

        // ── Persons ──────────────────────────────────────────────────────
        for (const p of personRows) {
          await tx.person.create({
            data: {
              householdId:      hh.id,
              name:             String(p['الاسم الكامل *']).trim(),
              nationalId:       p['الرقم القومي'] ? String(p['الرقم القومي']).trim() : null,
              gender:           GENDER_MAP[p['الجنس *']],
              birthDate:        new Date(p['تاريخ الميلاد *']),
              role:             ROLE_MAP[p['الدور في الأسرة *']] ?? 'OTHER',
              maritalStatus:    SOCIAL_STATUS_MAP[p['الحالة الاجتماعية']] ?? 'SINGLE',
              residencyStatus:  RESIDENCY_MAP[p['حالة الإقامة']] ?? 'RESIDENT',
              isOrphan:         YESNO(p['يتيم']),
              isDisplaced:      YESNO(p['مشرد']),
              isBride:          YESNO(p['عروسة']),
              isStudent:        YESNO(p['طالب']),
              isSonContributor: YESNO(p['مساهم في الدخل']),
            },
          });
        }

        // ── Income Sources ───────────────────────────────────────────────
        for (const inc of incomeRows) {
          await tx.incomeSource.create({
            data: {
              householdId:         hh.id,
              channel:             CHANNEL_MAP[inc['قناة الدخل *']],
              monthlyAmount:       new Decimal(inc['المبلغ الشهري *']),
              verified:            VERIF_MAP[inc['حالة التوثيق *']] ?? 'UNVERIFIED',
            },
          });
        }

        // ── Burdens ──────────────────────────────────────────────────────
        for (const b of (burdensByExt[extId] ?? [])) {
          let desc = String(b['تصنيف العبء *'] || b['نوع العبء *']).trim();
          if (b['المبلغ/التفاصيل']) {
            desc += ` - القيمة/التفاصيل: ${b['المبلغ/التفاصيل']}`;
          }
          if (b['ملاحظة']) {
            desc += ` - ملاحظة: ${b['ملاحظة']}`;
          }
          await tx.temporaryBurden.create({
            data: {
              householdId: hh.id,
              type:        BURDEN_TYPE_MAP[b['تصنيف العبء *']] ?? 'DEBT',
              grade:       GRADE_MAP[b['درجة الشدة']] ?? null,
              description: desc,
            },
          });
        }

        results.success++;
        results.created.push({ externalId: extId, code, householdId: hh.id });
      });

    } catch (err) {
      results.failed++;
      results.errors.push({
        sheet: 'الأسر', row: rowIdx, externalId: extId,
        messages: [`خطأ في الحفظ: ${err.message}`],
      });
    }
  }

  return results;
}

function groupBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = String(item[key] ?? '').trim();
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {});
}

module.exports = { importHouseholds };
