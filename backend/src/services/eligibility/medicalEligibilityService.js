/**
 * CharityHub Medical Eligibility Service
 * 
 * Determines medical service eligibility based on category, chronic status, and service history.
 * 
 * Business Rules:
 * - Category C: service every 30 days
 * - Category B: service every 60 days
 * - Category A: service every 90 days
 * - If chronic = true: reduce interval by 10 days
 * - Auto-calculate next_allowed_date
 * - Return eligibility status: Eligible, NotEligible, NeedsReview
 */

const prisma = require('../../config/prisma');
const { MedicalCategory } = require('@prisma/client');
const { AppError, NotFoundError } = require('../../utils/errors');

/**
 * Base service intervals (in days) by medical category
 */
const BASE_INTERVALS = {
  [MedicalCategory.C]: 30,
  [MedicalCategory.B]: 60,
  [MedicalCategory.A]: 90,
};

/**
 * Chronic disease interval reduction (in days)
 */
const CHRONIC_REDUCTION_DAYS = 10;

/**
 * Eligibility status codes
 */
const ELIGIBILITY_STATUS = {
  ELIGIBLE: 'Eligible',
  NOT_ELIGIBLE: 'NotEligible',
  NEEDS_REVIEW: 'NeedsReview',
};

/**
 * Arabic labels for eligibility status
 */
const ELIGIBILITY_LABELS = {
  [ELIGIBILITY_STATUS.ELIGIBLE]: 'مؤهل',
  [ELIGIBILITY_STATUS.NOT_ELIGIBLE]: 'غير مؤهل',
  [ELIGIBILITY_STATUS.NEEDS_REVIEW]: 'يحتاج مراجعة',
};

/**
 * Calculate service interval based on category and chronic status
 * @param {string} category - Medical category (A, B, or C)
 * @param {boolean} chronic - Whether the condition is chronic
 * @returns {number} Service interval in days
 */
function calculateServiceInterval(category, chronic = false) {
  const baseInterval = BASE_INTERVALS[category];
  
  if (!baseInterval) {
    throw new AppError(`Invalid medical category: ${category}`, 400, 'VALIDATION_ERROR');
  }

  if (chronic) {
    return Math.max(1, baseInterval - CHRONIC_REDUCTION_DAYS); // Ensure at least 1 day
  }

  return baseInterval;
}

/**
 * Calculate next allowed service date
 * @param {Date|null} lastServiceDate - Last service date (null if never served)
 * @param {number} intervalDays - Service interval in days
 * @returns {Date} Next allowed service date
 */
function calculateNextAllowedDate(lastServiceDate, intervalDays) {
  if (!lastServiceDate) {
    // If never served, eligible immediately (next allowed = today)
    return new Date();
  }

  const nextDate = new Date(lastServiceDate);
  nextDate.setDate(nextDate.getDate() + intervalDays);
  
  return nextDate;
}

/**
 * Determine eligibility status based on current date and next allowed date
 * @param {Date} nextAllowedDate - Next allowed service date
 * @param {Date|null} currentDate - Current date (defaults to now)
 * @returns {Object} Eligibility status object
 */
function determineEligibilityStatus(nextAllowedDate, currentDate = null) {
  const now = currentDate || new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const nextAllowed = new Date(
    nextAllowedDate.getFullYear(),
    nextAllowedDate.getMonth(),
    nextAllowedDate.getDate()
  );

  // Compare dates (ignore time)
  const daysUntilEligible = Math.ceil((nextAllowed - today) / (1000 * 60 * 60 * 24));

  if (daysUntilEligible <= 0) {
    // Eligible now or overdue
    return {
      status: ELIGIBILITY_STATUS.ELIGIBLE,
      label: ELIGIBILITY_LABELS[ELIGIBILITY_STATUS.ELIGIBLE],
      daysUntilEligible: 0,
      isOverdue: daysUntilEligible < 0,
    };
  }

  if (daysUntilEligible <= 7) {
    // Eligible within 7 days - might need review for scheduling
    return {
      status: ELIGIBILITY_STATUS.NEEDS_REVIEW,
      label: ELIGIBILITY_LABELS[ELIGIBILITY_STATUS.NEEDS_REVIEW],
      daysUntilEligible,
      isOverdue: false,
    };
  }

  // Not yet eligible
  return {
    status: ELIGIBILITY_STATUS.NOT_ELIGIBLE,
    label: ELIGIBILITY_LABELS[ELIGIBILITY_STATUS.NOT_ELIGIBLE],
    daysUntilEligible,
    isOverdue: false,
  };
}

/**
 * Evaluate medical eligibility for a single medical record
 * @param {Object} medicalRecord - Medical record object
 * @param {Date|null} currentDate - Current date for evaluation (defaults to now)
 * @returns {Object} Eligibility evaluation result
 */
function evaluateMedicalRecordEligibility(medicalRecord, currentDate = null) {
  if (!medicalRecord) {
    throw new AppError('Medical record is required', 400, 'VALIDATION_ERROR');
  }

  const { medical_category, chronic, last_service_date, next_allowed_date } = medicalRecord;

  // Calculate service interval
  const intervalDays = calculateServiceInterval(medical_category, chronic);

  // Calculate next allowed date (use existing if present and valid, otherwise calculate)
  let nextAllowedDate;
  if (next_allowed_date) {
    nextAllowedDate = new Date(next_allowed_date);
  } else {
    nextAllowedDate = calculateNextAllowedDate(
      last_service_date ? new Date(last_service_date) : null,
      intervalDays
    );
  }

  // Determine eligibility status
  const eligibility = determineEligibilityStatus(nextAllowedDate, currentDate);

  return {
    medicalRecordId: medicalRecord.id,
    memberId: medicalRecord.member_id,
    medicalCategory: medical_category,
    chronic,
    lastServiceDate: last_service_date ? new Date(last_service_date).toISOString() : null,
    calculatedNextAllowedDate: nextAllowedDate.toISOString(),
    serviceIntervalDays: intervalDays,
    eligibility,
  };
}

/**
 * Evaluate medical eligibility for a member (all their medical records)
 * @param {string} memberId - Member UUID
 * @param {Date|null} currentDate - Current date for evaluation (defaults to now)
 * @returns {Promise<Object>} Member eligibility evaluation result
 */
async function evaluateMemberMedicalEligibility(memberId, currentDate = null) {
  if (!memberId) {
    throw new AppError('Member ID is required', 400, 'VALIDATION_ERROR');
  }

  try {
    // Fetch member with medical records
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        medicalRecords: {
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!member) {
      throw new NotFoundError('Member');
    }

    if (!member.medicalRecords || member.medicalRecords.length === 0) {
      return {
        memberId: member.id,
        memberName: member.full_name,
        hasMedicalRecords: false,
        overallEligibility: {
          status: ELIGIBILITY_STATUS.NOT_ELIGIBLE,
          label: ELIGIBILITY_LABELS[ELIGIBILITY_STATUS.NOT_ELIGIBLE],
          reason: 'لا توجد سجلات طبية',
        },
        records: [],
      };
    }

    // Evaluate each medical record
    const recordEvaluations = member.medicalRecords.map((record) =>
      evaluateMedicalRecordEligibility(record, currentDate)
    );

    // Determine overall eligibility (most urgent record takes precedence)
    const eligibleRecords = recordEvaluations.filter(
      (r) => r.eligibility.status === ELIGIBILITY_STATUS.ELIGIBLE
    );
    const needsReviewRecords = recordEvaluations.filter(
      (r) => r.eligibility.status === ELIGIBILITY_STATUS.NEEDS_REVIEW
    );

    let overallStatus;
    let overallLabel;
    let overallReason;

    if (eligibleRecords.length > 0) {
      overallStatus = ELIGIBILITY_STATUS.ELIGIBLE;
      overallLabel = ELIGIBILITY_LABELS[ELIGIBILITY_STATUS.ELIGIBLE];
      overallReason = `${eligibleRecords.length} سجل طبي مؤهل للخدمة`;
    } else if (needsReviewRecords.length > 0) {
      overallStatus = ELIGIBILITY_STATUS.NEEDS_REVIEW;
      overallLabel = ELIGIBILITY_LABELS[ELIGIBILITY_STATUS.NEEDS_REVIEW];
      overallReason = `${needsReviewRecords.length} سجل طبي يحتاج مراجعة`;
    } else {
      overallStatus = ELIGIBILITY_STATUS.NOT_ELIGIBLE;
      overallLabel = ELIGIBILITY_LABELS[ELIGIBILITY_STATUS.NOT_ELIGIBLE];
      overallReason = 'لا توجد سجلات طبية مؤهلة حالياً';
    }

    return {
      memberId: member.id,
      memberName: member.full_name,
      hasMedicalRecords: true,
      overallEligibility: {
        status: overallStatus,
        label: overallLabel,
        reason: overallReason,
      },
      records: recordEvaluations,
      evaluatedAt: (currentDate || new Date()).toISOString(),
    };
  } catch (error) {
    if (error instanceof AppError || error instanceof NotFoundError) {
      throw error;
    }

    console.error('Error evaluating member medical eligibility:', error);
    throw new AppError(
      'Failed to evaluate member medical eligibility',
      500,
      'ELIGIBILITY_ERROR',
      { originalError: error.message }
    );
  }
}

/**
 * Evaluate medical eligibility for a family (all members)
 * @param {string} familyId - Family UUID
 * @param {Date|null} currentDate - Current date for evaluation (defaults to now)
 * @returns {Promise<Object>} Family eligibility evaluation result
 */
async function evaluateFamilyMedicalEligibility(familyId, currentDate = null) {
  if (!familyId) {
    throw new AppError('Family ID is required', 400, 'VALIDATION_ERROR');
  }

  try {
    // Fetch family with members and their medical records
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      include: {
        members: {
          include: {
            medicalRecords: {
              orderBy: { created_at: 'desc' },
            },
          },
        },
      },
    });

    if (!family) {
      throw new NotFoundError('Family');
    }

    if (!family.members || family.members.length === 0) {
      return {
        familyId: family.id,
        familyNationalId: family.national_id,
        familyHeadName: family.head_name,
        hasMembers: false,
        overallEligibility: {
          status: ELIGIBILITY_STATUS.NOT_ELIGIBLE,
          label: ELIGIBILITY_LABELS[ELIGIBILITY_STATUS.NOT_ELIGIBLE],
          reason: 'لا يوجد أعضاء في العائلة',
        },
        members: [],
      };
    }

    // Evaluate each member
    const memberEvaluations = await Promise.all(
      family.members.map((member) => {
        if (member.medicalRecords && member.medicalRecords.length > 0) {
          return evaluateMemberMedicalEligibility(member.id, currentDate);
        }
        // Member with no medical records
        return {
          memberId: member.id,
          memberName: member.full_name,
          hasMedicalRecords: false,
          overallEligibility: {
            status: ELIGIBILITY_STATUS.NOT_ELIGIBLE,
            label: ELIGIBILITY_LABELS[ELIGIBILITY_STATUS.NOT_ELIGIBLE],
            reason: 'لا توجد سجلات طبية',
          },
          records: [],
        };
      })
    );

    // Determine overall family eligibility
    const eligibleMembers = memberEvaluations.filter(
      (m) => m.overallEligibility.status === ELIGIBILITY_STATUS.ELIGIBLE
    );
    const needsReviewMembers = memberEvaluations.filter(
      (m) => m.overallEligibility.status === ELIGIBILITY_STATUS.NEEDS_REVIEW
    );

    let overallStatus;
    let overallLabel;
    let overallReason;

    if (eligibleMembers.length > 0) {
      overallStatus = ELIGIBILITY_STATUS.ELIGIBLE;
      overallLabel = ELIGIBILITY_LABELS[ELIGIBILITY_STATUS.ELIGIBLE];
      overallReason = `${eligibleMembers.length} عضو مؤهل للخدمة الطبية`;
    } else if (needsReviewMembers.length > 0) {
      overallStatus = ELIGIBILITY_STATUS.NEEDS_REVIEW;
      overallLabel = ELIGIBILITY_LABELS[ELIGIBILITY_STATUS.NEEDS_REVIEW];
      overallReason = `${needsReviewMembers.length} عضو يحتاج مراجعة`;
    } else {
      overallStatus = ELIGIBILITY_STATUS.NOT_ELIGIBLE;
      overallLabel = ELIGIBILITY_LABELS[ELIGIBILITY_STATUS.NOT_ELIGIBLE];
      overallReason = 'لا يوجد أعضاء مؤهلين للخدمة الطبية حالياً';
    }

    return {
      familyId: family.id,
      familyNationalId: family.national_id,
      familyHeadName: family.head_name,
      hasMembers: true,
      overallEligibility: {
        status: overallStatus,
        label: overallLabel,
        reason: overallReason,
      },
      members: memberEvaluations,
      evaluatedAt: (currentDate || new Date()).toISOString(),
    };
  } catch (error) {
    if (error instanceof AppError || error instanceof NotFoundError) {
      throw error;
    }

    console.error('Error evaluating family medical eligibility:', error);
    throw new AppError(
      'Failed to evaluate family medical eligibility',
      500,
      'ELIGIBILITY_ERROR',
      { originalError: error.message }
    );
  }
}

/**
 * Update medical record with calculated next_allowed_date
 * @param {string} medicalRecordId - Medical record UUID
 * @param {Date|null} serviceDate - Service date (defaults to now)
 * @returns {Promise<Object>} Updated medical record with new next_allowed_date
 */
async function updateMedicalRecordAfterService(medicalRecordId, serviceDate = null) {
  if (!medicalRecordId) {
    throw new AppError('Medical record ID is required', 400, 'VALIDATION_ERROR');
  }

  try {
    const record = await prisma.medicalRecord.findUnique({
      where: { id: medicalRecordId },
    });

    if (!record) {
      throw new NotFoundError('Medical record');
    }

    const serviceDateObj = serviceDate ? new Date(serviceDate) : new Date();
    const intervalDays = calculateServiceInterval(record.medical_category, record.chronic);
    const nextAllowedDate = calculateNextAllowedDate(serviceDateObj, intervalDays);

    const updated = await prisma.medicalRecord.update({
      where: { id: medicalRecordId },
      data: {
        last_service_date: serviceDateObj,
        next_allowed_date: nextAllowedDate,
      },
    });

    return {
      medicalRecordId: updated.id,
      lastServiceDate: updated.last_service_date.toISOString(),
      nextAllowedDate: updated.next_allowed_date.toISOString(),
      serviceIntervalDays: intervalDays,
    };
  } catch (error) {
    if (error instanceof AppError || error instanceof NotFoundError) {
      throw error;
    }

    console.error('Error updating medical record:', error);
    throw new AppError(
      'Failed to update medical record',
      500,
      'ELIGIBILITY_ERROR',
      { originalError: error.message }
    );
  }
}

/**
 * Batch evaluate multiple families
 * @param {Array<string>} familyIds - Array of family UUIDs
 * @param {Date|null} currentDate - Current date for evaluation (defaults to now)
 * @returns {Promise<Array>} Array of eligibility evaluation results
 */
async function evaluateBatchFamilyEligibility(familyIds, currentDate = null) {
  if (!Array.isArray(familyIds) || familyIds.length === 0) {
    throw new AppError('Family IDs array is required', 400, 'VALIDATION_ERROR');
  }

  const BATCH_SIZE = 50;
  const results = [];

  for (let i = 0; i < familyIds.length; i += BATCH_SIZE) {
    const batch = familyIds.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.allSettled(
      batch.map((id) => evaluateFamilyMedicalEligibility(id, currentDate))
    );

    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        console.error(`Failed to evaluate eligibility for family ${batch[index]}:`, result.reason);
        results.push({
          familyId: batch[index],
          error: result.reason.message,
          evaluatedAt: (currentDate || new Date()).toISOString(),
        });
      }
    });
  }

  return results;
}

module.exports = {
  // Main evaluation functions
  evaluateFamilyMedicalEligibility,
  evaluateMemberMedicalEligibility,
  evaluateMedicalRecordEligibility,
  evaluateBatchFamilyEligibility,
  
  // Update functions
  updateMedicalRecordAfterService,
  
  // Utility functions (exported for testing)
  calculateServiceInterval,
  calculateNextAllowedDate,
  determineEligibilityStatus,
  
  // Constants
  BASE_INTERVALS,
  CHRONIC_REDUCTION_DAYS,
  ELIGIBILITY_STATUS,
  ELIGIBILITY_LABELS,
};
