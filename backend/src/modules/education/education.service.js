const prisma = require('../../config/prisma');
const { ValidationError, ConflictError } = require('../../utils/errors');

function getAcademicYear(date = new Date()) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  return m >= 9 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

function computeAverageScore(subjects, gradeInputType) {
  if (!subjects || subjects.length === 0) return null;
  
  if (gradeInputType === 'LETTER') {
    const weights = { FAIL: 0, PASS: 55, GOOD: 70, VERY_GOOD: 80, EXCELLENT: 92 };
    let sum = 0;
    let count = 0;
    for (const sub of subjects) {
      if (sub.letterGrade && weights[sub.letterGrade] !== undefined) {
        sum += weights[sub.letterGrade];
        count++;
      }
    }
    return count > 0 ? parseFloat((sum / count).toFixed(2)) : null;
  } else {
    let sum = 0;
    let count = 0;
    for (const sub of subjects) {
      if (sub.score !== undefined && sub.score !== null) {
        const maxScore = sub.maxScore || 100;
        sum += (sub.score / maxScore) * 100;
        count++;
      }
    }
    return count > 0 ? parseFloat((sum / count).toFixed(2)) : null;
  }
}

function computeOverallGrade(score) {
  if (score === null || score === undefined) return null;
  if (score >= 85) return 'EXCELLENT';
  if (score >= 75) return 'VERY_GOOD';
  if (score >= 65) return 'GOOD';
  if (score >= 50) return 'PASS';
  return 'FAIL';
}

function computeQuranProgress(juzCount) {
  if (juzCount === null || juzCount === undefined) return null;
  // NOTE 1: juzCount is Decimal, can be 0.5, 1.5, etc.
  return parseFloat(((juzCount / 30) * 100).toFixed(2));
}

function computeQuranOverallScore(quranGrade, attendancePercent) {
  if (quranGrade === null || quranGrade === undefined) return null;
  const attendanceScore = attendancePercent !== null && attendancePercent !== undefined ? attendancePercent : 0;
  return parseFloat(((quranGrade * 2 + attendanceScore) / 3).toFixed(2));
}

function computeTotalScore(averageScore, quranOverallScore) {
  if (averageScore !== null && quranOverallScore !== null) {
    return parseFloat(((averageScore * 2 + quranOverallScore) / 3).toFixed(2));
  }
  if (averageScore !== null) return averageScore;
  if (quranOverallScore !== null) return quranOverallScore;
  return null;
}

function checkNeedsLevelUpdate(record) {
  // NOTE 2: READ-ONLY check. Only return true/false.
  return record.academicYear !== getAcademicYear();
}

function getAgeFromNationalId(nationalId) {
  if (!nationalId || nationalId.length !== 14) return null;
  const centuryDigit = parseInt(nationalId.charAt(0), 10);
  const yy = parseInt(nationalId.substring(1, 3), 10);
  const mm = parseInt(nationalId.substring(3, 5), 10) - 1;
  const dd = parseInt(nationalId.substring(5, 7), 10);
  
  let year = 1900 + yy;
  if (centuryDigit === 3) year = 2000 + yy;
  
  const birthDate = new Date(year, mm, dd);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

const recordInclude = {
  person: {
    select: {
      id: true, name: true, nationalId: true, gender: true, birthDate: true,
    },
  },
  household: {
    select: {
      id: true, code: true, primaryPhone: true, whatsappPhone: true,
      persons: { where: { isHead: true }, select: { name: true } },
      scoreResults: {
        orderBy: { calculatedAt: 'desc' }, take: 1,
        select: { classificationTag: true, decisionNote: true },
      },
    },
  },
};

function enrichRecord(record) {
  if (!record) return null;
  
  const needsLevelUpdate = checkNeedsLevelUpdate(record);
  const age = getAgeFromNationalId(record.person.nationalId) || 
              (new Date().getFullYear() - new Date(record.person.birthDate).getFullYear());
  
  const headName = record.household.persons?.[0]?.name || null;
  const classificationTag = record.household.scoreResults?.[0]?.classificationTag || null;

  return {
    ...record,
    needsLevelUpdate,
    averageScore: record.averageScore ? parseFloat(record.averageScore.toString()) : null,
    quranJuzCount: record.quranJuzCount ? parseFloat(record.quranJuzCount.toString()) : null,
    quranProgress: record.quranProgress ? parseFloat(record.quranProgress.toString()) : null,
    quranGrade: record.quranGrade ? parseFloat(record.quranGrade.toString()) : null,
    quranAttendancePercent: record.quranAttendancePercent,
    quranOverallScore: record.quranOverallScore ? parseFloat(record.quranOverallScore.toString()) : null,
    totalScore: record.totalScore ? parseFloat(record.totalScore.toString()) : null,
    person: {
      ...record.person,
      age,
    },
    household: {
      id: record.household.id,
      code: record.household.code,
      primaryPhone: record.household.primaryPhone,
      whatsappPhone: record.household.whatsappPhone,
      headName,
      classificationTag,
    }
  };
}

const educationService = {
  list: async (query) => {
    const page = parseInt(query.page) || 1;
    const limit = Math.min(parseInt(query.limit) || 12, 100);
    const skip = (page - 1) * limit;

    const where = {};
    if (query.academicYear) {
      where.academicYear = query.academicYear;
    }
    if (query.studentLevel) {
      where.studentLevel = query.studentLevel;
    }
    if (query.overallGrade) {
      where.overallGrade = query.overallGrade;
    }
    if (query.quranProgressMin || query.quranProgressMax) {
      where.quranProgress = {};
      if (query.quranProgressMin) where.quranProgress.gte = parseFloat(query.quranProgressMin);
      if (query.quranProgressMax) where.quranProgress.lte = parseFloat(query.quranProgressMax);
    }
    if (query.search) {
      where.OR = [
        { person: { name: { contains: query.search, mode: 'insensitive' } } },
        { person: { nationalId: { contains: query.search, mode: 'insensitive' } } },
        { household: { code: { contains: query.search, mode: 'insensitive' } } },
        { household: { persons: { some: { name: { contains: query.search, mode: 'insensitive' } } } } },
      ];
    }
    if (query.classification) {
      where.household = {
        ...where.household,
        scoreResults: { some: { classificationTag: { contains: query.classification, mode: 'insensitive' } } }
      };
    }
    if (query.householdId) {
      where.householdId = query.householdId;
    }

    let orderBy = { totalScore: 'desc' };
    if (query.sort) {
      const [field, order] = query.sort.split(':');
      if (['totalScore', 'averageScore', 'quranProgress', 'updatedAt', 'studentLevel'].includes(field)) {
        orderBy = { [field]: order === 'asc' ? 'asc' : 'desc' };
      }
    }

    const [total, records] = await prisma.$transaction([
      prisma.studentAcademicRecord.count({ where }),
      prisma.studentAcademicRecord.findMany({
        where,
        include: recordInclude,
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    return {
      data: records.map(enrichRecord),
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  },

  getKpis: async (query) => {
    const academicYear = query.academicYear || getAcademicYear();

    const totalStudents = await prisma.studentAcademicRecord.count({
      where: { academicYear },
    });

    const excellentCount = await prisma.studentAcademicRecord.count({
      where: {
        academicYear,
        OR: [
          { overallGrade: 'EXCELLENT' },
          { averageScore: { gte: 85 } },
        ],
      },
    });

    const failingCount = await prisma.studentAcademicRecord.count({
      where: {
        academicYear,
        OR: [
          { overallGrade: 'FAIL' },
          { averageScore: { lt: 50 } },
        ],
      },
    });

    const avgTotalScoreAgg = await prisma.studentAcademicRecord.aggregate({
      where: { academicYear },
      _avg: { totalScore: true },
    });

    const quranStudentsCount = await prisma.studentAcademicRecord.count({
      where: { academicYear, quranJuzCount: { gt: 0 } },
    });

    const needsUpdateCount = await prisma.studentAcademicRecord.count({
      where: { academicYear: { not: getAcademicYear() } },
    });

    const levelBreakdownAgg = await prisma.studentAcademicRecord.groupBy({
      by: ['studentLevel'],
      where: { academicYear },
      _count: { id: true },
    });
    
    const levelBreakdown = levelBreakdownAgg.reduce((acc, curr) => {
      acc[curr.studentLevel] = curr._count.id;
      return acc;
    }, {});

    const allRecords = await prisma.studentAcademicRecord.findMany({
      where: { academicYear },
      select: { household: { select: { scoreResults: { orderBy: { calculatedAt: 'desc' }, take: 1, select: { classificationTag: true } } } } }
    });

    const classificationBreakdown = allRecords.reduce((acc, curr) => {
      const tag = curr.household.scoreResults?.[0]?.classificationTag || 'UNCLASSIFIED';
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});

    return {
      totalStudents,
      excellentCount,
      failingCount,
      avgTotalScore: avgTotalScoreAgg._avg.totalScore ? parseFloat(avgTotalScoreAgg._avg.totalScore.toString()) : 0,
      quranStudentsCount,
      needsUpdateCount,
      levelBreakdown,
      classificationBreakdown
    };
  },

  getById: async (id) => {
    const record = await prisma.studentAcademicRecord.findUnique({
      where: { id },
      include: recordInclude,
    });
    if (!record) throw new Error('Record not found');
    return enrichRecord(record);
  },

  create: async (body, user) => {
    const { personId, householdId, academicYear, studentLevel, isSpecialEducation, gradeYear, schoolName, gradeInputType, subjects, quranJuzCount, quranLastSurah, quranTeacher, quranInstitute, quranCustomInstitute, quranGrade, quranAttendancePercent, notes } = body;

    let finalHouseholdId = householdId;
    if (householdId && !householdId.startsWith('c')) {
      const hh = await prisma.household.findUnique({ where: { code: householdId } });
      if (!hh) throw new ValidationError(`لم يتم العثور على أسرة برقم القيد: ${householdId}`);
      finalHouseholdId = hh.id;
    }

    let finalPersonId = personId;
    if (personId && !personId.startsWith('c')) {
      const p = await prisma.person.findFirst({ where: { OR: [{ nationalId: personId }, { id: personId }] } });
      if (!p) throw new ValidationError(`لم يتم العثور على شخص بالمعرف: ${personId}`);
      finalPersonId = p.id;
    }

    if (!studentLevel) throw new ValidationError("المرحلة الدراسية مطلوبة");

    const year = academicYear || getAcademicYear();

    const existingRecord = await prisma.studentAcademicRecord.findUnique({
      where: {
        personId_academicYear: {
          personId: finalPersonId,
          academicYear: year,
        }
      }
    });
    if (existingRecord) {
      throw new ConflictError(`يوجد سجل دراسي مسجل بالفعل لهذا الطالب في العام ${year}`);
    }

    const averageScore = computeAverageScore(subjects, gradeInputType);
    const overallGrade = computeOverallGrade(averageScore);
    const quranProgress = computeQuranProgress(quranJuzCount);
    const quranOverallScore = computeQuranOverallScore(quranGrade, quranAttendancePercent);
    const totalScore = computeTotalScore(averageScore, quranOverallScore);

    // Check if repeating
    let isRepeating = false;
    const prevRecords = await prisma.studentAcademicRecord.findMany({
      where: { personId: finalPersonId },
      orderBy: { academicYear: 'desc' },
      take: 1,
    });
    if (prevRecords.length > 0 && prevRecords[0].studentLevel === studentLevel) {
      isRepeating = true;
    }

    const record = await prisma.studentAcademicRecord.create({
      data: {
        personId: finalPersonId,
        householdId: finalHouseholdId,
        academicYear: year,
        studentLevel,
        isSpecialEducation: isSpecialEducation || false,
        gradeYear: gradeYear ? parseInt(gradeYear) : null,
        schoolName,
        isRepeating,
        gradeInputType,
        subjects: subjects || [],
        averageScore,
        overallGrade,
        quranJuzCount,
        quranProgress,
        quranLastSurah,
        quranTeacher,
        quranInstitute,
        quranCustomInstitute,
        quranGrade,
        quranAttendancePercent: quranAttendancePercent !== undefined ? quranAttendancePercent : null,
        quranOverallScore,
        totalScore,
        notes,
        createdById: user?.id,
      },
      include: recordInclude,
    });

    await prisma.person.update({
      where: { id: finalPersonId },
      data: {
        studentLevel,
        isSpecialEducation: isSpecialEducation || false,
        isStudent: studentLevel !== "NONE",
      }
    });

    return enrichRecord(record);
  },

  update: async (id, body) => {
    const { studentLevel, isSpecialEducation, gradeYear, schoolName, gradeInputType, subjects, quranJuzCount, quranLastSurah, quranTeacher, quranInstitute, quranCustomInstitute, quranGrade, quranAttendancePercent, notes } = body;

    const averageScore = computeAverageScore(subjects, gradeInputType);
    const overallGrade = computeOverallGrade(averageScore);
    const quranProgress = computeQuranProgress(quranJuzCount);
    const quranOverallScore = computeQuranOverallScore(quranGrade, quranAttendancePercent);
    const totalScore = computeTotalScore(averageScore, quranOverallScore);

    const existing = await prisma.studentAcademicRecord.findUnique({ where: { id } });
    if (!existing) throw new Error('Record not found');

    // Check if repeating (excluding current record)
    let isRepeating = existing.isRepeating;
    if (studentLevel && studentLevel !== existing.studentLevel) {
        const prevRecords = await prisma.studentAcademicRecord.findMany({
            where: { personId: existing.personId, id: { not: id } },
            orderBy: { academicYear: 'desc' },
            take: 1,
        });
        if (prevRecords.length > 0 && prevRecords[0].studentLevel === studentLevel) {
            isRepeating = true;
        } else {
            isRepeating = false;
        }
    }

    const record = await prisma.studentAcademicRecord.update({
      where: { id },
      data: {
        studentLevel,
        isSpecialEducation: isSpecialEducation !== undefined ? isSpecialEducation : existing.isSpecialEducation,
        gradeYear: gradeYear !== undefined ? (gradeYear ? parseInt(gradeYear) : null) : existing.gradeYear,
        schoolName: schoolName !== undefined ? schoolName : existing.schoolName,
        isRepeating,
        gradeInputType,
        subjects: subjects !== undefined ? subjects : existing.subjects,
        averageScore,
        overallGrade,
        quranJuzCount,
        quranProgress,
        quranLastSurah,
        quranTeacher,
        quranInstitute,
        quranCustomInstitute,
        quranGrade,
        quranAttendancePercent: quranAttendancePercent !== undefined ? quranAttendancePercent : existing.quranAttendancePercent,
        quranOverallScore,
        totalScore,
        notes: notes !== undefined ? notes : existing.notes,
      },
      include: recordInclude,
    });

    if (studentLevel || isSpecialEducation !== undefined) {
      await prisma.person.update({
        where: { id: existing.personId },
        data: {
          ...(studentLevel && { studentLevel, isStudent: studentLevel !== "NONE" }),
          ...(isSpecialEducation !== undefined && { isSpecialEducation }),
        }
      });
    }

    return enrichRecord(record);
  },

  remove: async (id) => {
    await prisma.studentAcademicRecord.delete({ where: { id } });
    return true;
  },

  getPersonHistory: async (personId) => {
    const records = await prisma.studentAcademicRecord.findMany({
      where: { personId },
      orderBy: { academicYear: 'desc' },
      include: recordInclude,
    });
    return records.map(enrichRecord);
  },

  householdLookup: async (query) => {
    const q = query.q || '';
    if (!q || q.length < 2) return [];

    const households = await prisma.household.findMany({
      where: {
        OR: [
          { code: { contains: q, mode: 'insensitive' } },
          { persons: { some: { name: { contains: q, mode: 'insensitive' }, role: { in: ['HEAD', 'SPOUSE'] } } } }
        ]
      },
      take: 10,
      include: {
        persons: {
          select: {
            id: true,
            name: true,
            role: true,
            isStudent: true,
            studentLevel: true,
            birthDate: true,
            nationalId: true,
          }
        }
      }
    });

    return households.map(hh => {
      const head = hh.persons.find(p => p.role === 'HEAD')?.name;
      const spouse = hh.persons.find(p => p.role === 'SPOUSE')?.name;
      return {
        id: hh.id,
        code: hh.code,
        headName: head || null,
        spouseName: spouse || null,
        persons: hh.persons.map(p => ({
          ...p,
          age: getAgeFromNationalId(p.nationalId) || (new Date().getFullYear() - new Date(p.birthDate).getFullYear())
        }))
      };
    });
  },
};

module.exports = educationService;
