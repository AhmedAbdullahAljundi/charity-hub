/**
 * Families Controller
 */

const prisma = require('../../config/prisma')
const { calculateFamilyScore } = require('../../services/scoring/scoringService')
const { AppError, NotFoundError } = require('../../utils/errors')
const { registerFamily } = require('./families.service')
const { validateRegistrationPayload } = require('./families.validator')

function isPrismaUniqueConstraintError(error) {
  return Boolean(error && typeof error === 'object' && error.code === 'P2002')
}

async function registerFromBody(body) {
  const validated = validateRegistrationPayload(body)
  return registerFamily(validated)
}

const familiesController = {
  /**
   * Full family registration (Family + Persons + Income + Medical + Education + Scoring)
   * POST /api/v1/families/register
   */
  register: async (req, res, next) => {
    try {
      const result = await registerFromBody(req.body)

      res.status(201).json({
        success: true,
        familyId: result.familyId,
        vulnerabilityIndex: result.scoring.vulnerabilityIndex,
        classification: result.scoring.classification,
      })
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        return next(new AppError('رقم الهوية/التسجيل مسجل مسبقاً', 409, 'CONFLICT_ERROR'))
      }
      if (error.name === 'ValidationError') {
        return next(new AppError(error.message, 400, 'VALIDATION_ERROR'))
      }
      next(error)
    }
  },

  /**
   * List all families
   */
  list: async (req, res, next) => {
    try {
      const { page = 1, limit = 50, search } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      const where = {};
      if (search) {
        where.OR = [
          { registration_number: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          {
            persons: {
              some: {
                full_name: { contains: search, mode: 'insensitive' },
              },
            },
          },
        ];
      }

      const [families, total] = await Promise.all([
        prisma.family.findMany({
          where,
          skip,
          take: parseInt(limit),
          orderBy: { created_at: 'desc' },
          include: {
            persons: {
              where: {
                OR: [{ role_in_family: 'HUSBAND' }, { role_in_family: 'WIFE' }],
              },
              take: 1,
            },
            scoringRecords: {
              orderBy: { calculated_at: 'desc' },
              take: 1,
            },
            _count: {
              select: {
                persons: true,
              },
            },
          },
        }),
        prisma.family.count({ where }),
      ]);

      // Map to a more frontend-friendly format
      const formattedFamilies = families.map((f) => {
        const head = f.persons[0];
        const latestScoring = f.scoringRecords[0];

        return {
          id: f.id,
          headName: head ? head.full_name : 'غير محدد',
          nationalId: f.registration_number,
          phone: f.phone || 'غير مسجل',
          address: f.address,
          members: f._count.persons,
          totalIncome: latestScoring ? parseFloat(latestScoring.total_income) : 0,
          vulnerabilityIndex: latestScoring ? parseFloat(latestScoring.vulnerability_index) : 0,
          classification: latestScoring ? latestScoring.classification : 'MODERATE',
        };
      });

      res.json({
        success: true,
        data: formattedFamilies,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get family by ID
   */
  getById: async (req, res, next) => {
    try {
      const { id } = req.params

      const family = await prisma.family.findUnique({
        where: { id },
        include: {
          persons: {
            include: {
              medicalCases: true,
              educationRecords: true,
            }
          },
          incomes: true,
          expenses: true,
          scoringRecords: {
            orderBy: { calculated_at: "desc" },
            take: 1
          }
        },
      })

      if (!family) {
        throw new NotFoundError('Family')
      }

      // If no scoring exists, auto-calculate it
      let latestScoring = family.scoringRecords[0];
      if (!latestScoring) {
        try {
          await familiesController._recalculateAndSaveScore(id);
          // Re-fetch the scoring record
          const freshScoring = await prisma.scoring.findFirst({
            where: { family_id: id },
            orderBy: { calculated_at: 'desc' }
          });
          latestScoring = freshScoring;
        } catch (err) {
          console.error('Auto-scoring failed for family', id, err.message);
        }
      }

      // Map to frontend format
      const headPerson = family.persons.find(
        (p) => p.role_in_family === 'HUSBAND' || p.role_in_family === 'WIFE'
      ) || family.persons[0] || null;

      // Calculate totalIncome directly from actual incomes (not just scoring snapshot)
      const calculatedTotalIncome = family.incomes.reduce((sum, i) => {
        const amt = typeof i.amount === 'object' ? parseFloat(i.amount.toString()) : parseFloat(i.amount || 0);
        return sum + amt;
      }, 0);

      const formattedFamily = {
        id: family.id,
        headName: headPerson ? headPerson.full_name : 'غير محدد',
        nationalId: family.registration_number,
        registration_number: family.registration_number,
        address: family.address,
        phone: family.phone,
        housing_type: family.housing_type,
        notes: family.notes,
        status: family.status || "نشط",
        category: family.social_status || "فقراء",
        classification: latestScoring ? latestScoring.classification : "OUT_OF_PRIORITY",
        vulnerabilityIndex: latestScoring ? parseFloat(latestScoring.vulnerability_index) : 0,
        totalIncome: calculatedTotalIncome,


        // Members mapping
        members: family.persons.map(p => ({
          id: p.id,
          name: p.full_name,
          nationalId: p.national_id,
          relation: p.role_in_family,
          birthDate: p.birth_date,
          gender: p.gender === "MALE" ? "ذكر" : "أنثى",
          education: p.education_level,
          job: p.occupation,
          maritalStatus: p.marital_status,
          hasDisability: p.disability,
        })),

        // Income mapping
        income: family.incomes.map(i => ({
          id: i.id,
          source: i.source_type,
          amount: parseFloat(i.amount),
          verified: i.verified,
          notes: i.notes
        })),

        // Flatten medical records from all persons
        medicalRecords: family.persons.flatMap(p =>
          p.medicalCases.map(m => {
            // Reverse map severity enum to Arabic
            const severityMap = { MILD: 'خفيف', MODERATE: 'متوسط', SEVERE: 'شديد', CRITICAL: 'حرج' };
            const categoryMap = { A: 'أ', B: 'ب', C: 'ج', D: 'د' };
            const isDisability = !!m.medical_category;
            return {
              id: m.id,
              personId: p.id,
              memberName: p.full_name,
              condition: m.disease_name,
              type: isDisability ? 'إعاقة' : (m.chronic ? 'مرض مزمن' : 'إصابة مؤقتة'),
              severity: severityMap[m.disease_severity] || m.disease_severity,
              disabilityClass: categoryMap[m.medical_category] || m.medical_category,
              severityScore: 0,
              treatment: m.notes || '',
              monthlyCost: parseFloat(m.treatment_cost || 0),
              hospital: m.doctor_name || '',
              startDate: m.last_service_date || '',
              needsFollowup: !!m.next_allowed_date,
              notes: m.notes || '',
            };
          })
        ),

        // Expenses mapping
        expenses: (family.expenses || []).map(e => ({
          id: e.id,
          item: e.category || e.description || '',
          amount: parseFloat(e.amount),
          category: e.category,
          notes: e.description,
          date: e.date,
        }))
      };

      res.json({
        success: true,
        data: formattedFamily,
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * Create family
   */
  create: async (req, res, next) => {
    try {
      // NOTE: The current DB schema stores family identifiers in `registration_number` (Family model)
      // and stores names/national IDs under Persons. The frontend "Add Family" form already sends
      // the full registration payload (family + persons + ...), even if arrays are empty.
      //
      // To avoid API confusion and broken payloads, treat POST /families as an alias of /families/register.
      const result = await registerFromBody(req.body)

      res.status(201).json({
        success: true,
        familyId: result.familyId,
        vulnerabilityIndex: result.scoring.vulnerabilityIndex,
        classification: result.scoring.classification,
      })
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        return next(new AppError('رقم الهوية/التسجيل مسجل مسبقاً', 409, 'CONFLICT_ERROR'))
      }
      next(error)
    }
  },

  /**
   * Update family
   */
  update: async (req, res, next) => {
    try {
      const { id } = req.params
      const data = req.body

      const family = await prisma.family.update({
        where: { id },
        data,
        include: {
          persons: true,
          incomes: true,
        },
      })

      await familiesController._recalculateAndSaveScore(id);

      res.json({
        success: true,
        data: family,
        message: 'تم تحديث العائلة بنجاح',
      })
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Family')
      }
      next(error)
    }
  },

  /**
   * Delete family
   */
  delete: async (req, res, next) => {
    try {
      const { id } = req.params

      await prisma.family.delete({
        where: { id },
      })

      res.json({
        success: true,
        message: 'تم حذف العائلة بنجاح',
      })
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundError('Family')
      }
      next(error)
    }
  },

  // Helper to recalculate and persist the score in the database
  _recalculateAndSaveScore: async (familyId) => {
    const scoreResult = await calculateFamilyScore(familyId);
    const { totalWeightedNeed, totalActualIncome, vulnerabilityIndex, classification, breakdown } = scoreResult.scoring;

    // Map classification back to Enum
    const enumMap = {
      'VERY_FRAGILE': 'VERY_FRAGILE',
      'FRAGILE': 'FRAGILE',
      'WEAK': 'WEAK',
      'MODERATE': 'MODERATE',
      'OUT_OF_PRIORITY': 'OUT_OF_PRIORITY'
    };

    await prisma.scoring.create({
      data: {
        family_id: familyId,
        total_need: totalWeightedNeed,
        total_income: totalActualIncome,
        vulnerability_index: vulnerabilityIndex,
        classification: enumMap[classification.code] || 'MODERATE',
        breakdown: breakdown,
      },
    });

    return scoreResult;
  },

  // Helper mappings for frontend to backend enums
  _mapRole: (role) => {
    const map = {
      'رب الأسرة': 'HUSBAND',
      'الزوجة': 'WIFE',
      'ابن': 'CHILD',
      'ابنة': 'CHILD'
    }
    return map[role] || 'OTHER'
  },

  _mapEducation: (level) => {
    if (!level) return 'NONE'
    if (level.includes('ابتدائي')) return 'PRIMARY'
    if (level.includes('إعدادي')) return 'PREPARATORY'
    if (level.includes('ثانوي') || level.includes('دبلوم')) return 'SECONDARY'
    if (level.includes('جامعي') || level.includes('دراسات')) return 'UNIVERSITY'
    if (level.includes('حضانة')) return 'NURSERY'
    return 'NONE'
  },

  _mapMaritalStatus: (status) => {
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

  _mapIncomeSource: (source) => {
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

  addPerson: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = req.body;

      const person = await prisma.person.create({
        data: {
          family_id: id,
          full_name: data.name,
          national_id: data.nationalId || null,
          role_in_family: familiesController._mapRole(data.relation),
          gender: data.gender === "ذكر" ? "MALE" : "FEMALE",
          birth_date: data.birthDate ? new Date(data.birthDate) : null,
          education_level: familiesController._mapEducation(data.education),
          occupation: data.job || null,
          marital_status: familiesController._mapMaritalStatus(data.maritalStatus),
          disability: data.hasDisability || false,
          notes: data.notes || null,
        }
      });

      // Recalculate and persist score
      await familiesController._recalculateAndSaveScore(id);

      res.status(201).json({
        success: true,
        data: person
      });
    } catch (error) {
      next(error);
    }
  },

  deletePerson: async (req, res, next) => {
    try {
      const personId = req.params.personId;
      const person = await prisma.person.delete({ where: { id: personId } });
      await familiesController._recalculateAndSaveScore(person.family_id);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },

  addIncome: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = req.body;

      const income = await prisma.income.create({
        data: {
          family_id: id,
          source_type: familiesController._mapIncomeSource(data.source),
          amount: parseFloat(data.amount),
          verified: data.verified || false,
          notes: data.notes || null
        }
      });

      // Recalculate and persist score
      await familiesController._recalculateAndSaveScore(id);

      res.status(201).json({
        success: true,
        data: income
      });
    } catch (error) {
      next(error);
    }
  },

  deleteIncome: async (req, res, next) => {
    try {
      const incomeId = req.params.incomeId;
      const income = await prisma.income.delete({ where: { id: incomeId } });
      await familiesController._recalculateAndSaveScore(income.family_id);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },


  // ---------- Expenses ----------
  addExpense: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const expense = await prisma.expense.create({
        data: {
          family_id: id,
          amount: parseFloat(data.amount),
          description: data.notes || data.description || null,
          category: data.item || data.category || null,
          date: data.date ? new Date(data.date) : undefined,
        },
      });
      await familiesController._recalculateAndSaveScore(id);
      res.status(201).json({ success: true, data: expense });
    } catch (error) {
      next(error);
    }
  },

  deleteExpense: async (req, res, next) => {
    try {
      const expenseId = req.params.expenseId;
      const expense = await prisma.expense.delete({ where: { id: expenseId } });
      await familiesController._recalculateAndSaveScore(expense.family_id);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },

  // ---------- Medical Cases ----------
  _mapSeverity(severity) {
    if (!severity) return null;
    const text = severity.toString().trim();
    if (text.includes('خفيف') || text.includes('أ') || text.includes('A')) return 'MILD';
    if (text.includes('متوسط') || text.includes('ب') || text.includes('B')) return 'MODERATE';
    if (text.includes('شديد') || text.includes('ج') || text.includes('C')) return 'SEVERE';
    if (text.includes('حرج') || text.includes('متقدم') || text.includes('د') || text.includes('D')) return 'CRITICAL';
    return null;
  },

  _mapDisabilityClass(code) {
    if (!code) return null;
    const text = code.toString().trim().toUpperCase();
    if (text.includes('أ') || text.includes('A')) return 'A';
    if (text.includes('ب') || text.includes('B')) return 'B';
    if (text.includes('ج') || text.includes('C')) return 'C';
    if (text.includes('د') || text.includes('D')) return 'D';
    return null;
  },

  addMedicalCase: async (req, res, next) => {
    try {
      const { personId } = req.params;
      const data = req.body;

      // Map frontend Arabic values to backend enums
      const isChronic = data.type === 'مرض مزمن' || data.chronic === true;
      const isDisability = data.type === 'إعاقة';

      const diseaseSeverity = familiesController._mapSeverity(data.severity);
      const medicalCategory = isDisability
        ? familiesController._mapDisabilityClass(data.disabilityClass || data.severity)
        : null;

      const medical = await prisma.medicalCase.create({
        data: {
          person_id: personId,
          disease_name: data.condition || data.disease_name || 'غير محدد',
          disease_severity: diseaseSeverity,
          chronic: isChronic,
          medical_category: medicalCategory,
          treatment_cost: data.monthlyCost ? parseFloat(data.monthlyCost) : null,
          doctor_name: data.hospital || null,
          notes: data.notes || null,
        },
      });

      if (isDisability) {
        await prisma.person.update({
          where: { id: personId },
          data: { disability: true }
        });
      }

      const person = await prisma.person.findUnique({ where: { id: personId } });
      await familiesController._recalculateAndSaveScore(person.family_id);
      res.status(201).json({ success: true, data: medical });
    } catch (error) {
      next(error);
    }
  },

  deleteMedicalCase: async (req, res, next) => {
    try {
      const { medicalId } = req.params;
      const medical = await prisma.medicalCase.delete({ where: { id: medicalId } });
      const person = await prisma.person.findUnique({ where: { id: medical.person_id } });
      await familiesController._recalculateAndSaveScore(person.family_id);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },
  getScore: async (req, res, next) => {
    try {
      const { id } = req.params
      const score = await calculateFamilyScore(id)
      res.json({
        success: true,
        data: score,
      })
    } catch (error) {
      next(error)
    }
  },
};

module.exports = familiesController
