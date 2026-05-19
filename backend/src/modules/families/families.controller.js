/**
 * Families Controller
 */

const familiesRepository = require('./families.repository')
const familiesHelpers = require('./families.helpers')
const scoringService = require('../scoring/scoring.service')
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
        familiesRepository.findMany(where, skip, parseInt(limit)),
        familiesRepository.count(where),
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
          systemRecommendation: latestScoring ? latestScoring.system_recommendation : null,
          normalizedPercent: latestScoring && latestScoring.normalized_percent ? parseFloat(latestScoring.normalized_percent) : null,
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

      const family = await familiesRepository.findById(id)

      if (!family) {
        throw new NotFoundError('Family')
      }

      // If no scoring exists, auto-calculate it
      let latestScoring = family.scoringRecords[0];
      if (!latestScoring) {
        try {
          await familiesHelpers.recalculateAndSaveScore(id);
          // Re-fetch the scoring record
          const freshScoring = await familiesRepository.getLatestScoring(id);
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
        // New 4-engine scoring fields
        systemRecommendation: latestScoring ? latestScoring.system_recommendation : null,
        humanDecision: latestScoring ? latestScoring.human_decision : null,
        reviewStatus: latestScoring ? latestScoring.review_status : null,
        vulnerabilityScore: latestScoring && latestScoring.vulnerability_score ? parseFloat(latestScoring.vulnerability_score) : null,
        reductionScore: latestScoring && latestScoring.reduction_score ? parseFloat(latestScoring.reduction_score) : null,
        confidenceScore: latestScoring && latestScoring.confidence_score ? parseFloat(latestScoring.confidence_score) : null,
        fraudRiskScore: latestScoring && latestScoring.fraud_risk_score ? parseFloat(latestScoring.fraud_risk_score) : null,
        finalScore: latestScoring && latestScoring.final_score ? parseFloat(latestScoring.final_score) : null,
        normalizedPercent: latestScoring && latestScoring.normalized_percent ? parseFloat(latestScoring.normalized_percent) : null,
        layerBreakdown: latestScoring ? latestScoring.layer_breakdown : null,
        topPositiveFactors: latestScoring ? latestScoring.top_positive_factors : null,
        topNegativeFactors: latestScoring ? latestScoring.top_negative_factors : null,
        scoringRecommendations: latestScoring ? latestScoring.recommendations : null,
        scoringWarnings: latestScoring ? latestScoring.warnings : null,


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

      const family = await familiesRepository.update(id, data)

      await familiesHelpers.recalculateAndSaveScore(id);

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

      await familiesRepository.delete(id)

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

  addPerson: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = req.body;

      const person = await familiesRepository.createPerson({
          family_id: id,
          full_name: data.name,
          national_id: data.nationalId || null,
          role_in_family: familiesHelpers.mapRole(data.relation),
          gender: data.gender === "ذكر" ? "MALE" : "FEMALE",
          birth_date: data.birthDate ? new Date(data.birthDate) : null,
          education_level: familiesHelpers.mapEducation(data.education),
          occupation: data.job || null,
          marital_status: familiesHelpers.mapMaritalStatus(data.maritalStatus),
          disability: data.hasDisability || false,
          notes: data.notes || null,
      });

      // Recalculate and persist score
      await familiesHelpers.recalculateAndSaveScore(id);

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
      const person = await familiesRepository.deletePerson(personId);
      await familiesHelpers.recalculateAndSaveScore(person.family_id);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },

  addIncome: async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = req.body;

      const income = await familiesRepository.createIncome({
          family_id: id,
          source_type: familiesHelpers.mapIncomeSource(data.source),
          amount: parseFloat(data.amount),
          verified: data.verified || false,
          notes: data.notes || null
      });

      // Recalculate and persist score
      await familiesHelpers.recalculateAndSaveScore(id);

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
      const income = await familiesRepository.deleteIncome(incomeId);
      await familiesHelpers.recalculateAndSaveScore(income.family_id);
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
      const expense = await familiesRepository.createExpense({
          family_id: id,
          amount: parseFloat(data.amount),
          description: data.notes || data.description || null,
          category: data.item || data.category || null,
          date: data.date ? new Date(data.date) : undefined,
      });
      await familiesHelpers.recalculateAndSaveScore(id);
      res.status(201).json({ success: true, data: expense });
    } catch (error) {
      next(error);
    }
  },

  deleteExpense: async (req, res, next) => {
    try {
      const expenseId = req.params.expenseId;
      const expense = await familiesRepository.deleteExpense(expenseId);
      await familiesHelpers.recalculateAndSaveScore(expense.family_id);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },

  // ---------- Medical Cases ----------
  addMedicalCase: async (req, res, next) => {
    try {
      const { personId } = req.params;
      const data = req.body;

      // Map frontend Arabic values to backend enums
      const isChronic = data.type === 'مرض مزمن' || data.chronic === true;
      const isDisability = data.type === 'إعاقة';

      const diseaseSeverity = familiesHelpers.mapSeverity(data.severity);
      const medicalCategory = isDisability
        ? familiesHelpers.mapDisabilityClass(data.disabilityClass || data.severity)
        : null;

      const medical = await familiesRepository.createMedicalCase({
          person_id: personId,
          disease_name: data.condition || data.disease_name || 'غير محدد',
          disease_severity: diseaseSeverity,
          chronic: isChronic,
          medical_category: medicalCategory,
          treatment_cost: data.monthlyCost ? parseFloat(data.monthlyCost) : null,
          doctor_name: data.hospital || null,
          notes: data.notes || null,
      });

      if (isDisability) {
        await familiesRepository.updatePerson(personId, { disability: true });
      }

      const person = await familiesRepository.getPersonById(personId);
      await familiesHelpers.recalculateAndSaveScore(person.family_id);
      res.status(201).json({ success: true, data: medical });
    } catch (error) {
      next(error);
    }
  },

  deleteMedicalCase: async (req, res, next) => {
    try {
      const { medicalId } = req.params;
      const medical = await familiesRepository.deleteMedicalCase(medicalId);
      const person = await familiesRepository.getPersonById(medical.person_id);
      await familiesHelpers.recalculateAndSaveScore(person.family_id);
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  },
  getScore: async (req, res, next) => {
    try {
      const { id } = req.params
      const result = await scoringService.calculateScore(id)
      res.json({
        success: true,
        data: result,
      })
    } catch (error) {
      next(error)
    }
  },
};

module.exports = familiesController


