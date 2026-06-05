const { ZERO, sum, toDecimal, mul, max } = require('../../../../shared/utils/decimal');
const { WEIGHTS, LAYER_CAPS } = require('../../registry/weights');
const {
  findHead,
  isResident,
  createLayerResult,
  triggeredRule,
} = require('../utils/layer-helpers');

function sonEmploymentKey(employmentType) {
  if (
    employmentType === 'ABROAD_WEAK' ||
    employmentType === 'ABROAD_MEDIUM' ||
    employmentType === 'ABROAD_REGULAR'
  ) {
    return 'ABROAD';
  }
  if (employmentType === 'SEASONAL') return 'SEASONAL';
  if (employmentType === 'REGULAR') return 'REGULAR';
  return null;
}

function calculateL7(ctx) {
  const { input, weights } = ctx;
  const rules = [];
  const contributions = [];

  const head = findHead(input);
  if (head && isResident(head) && head.employmentType !== 'NONE') {
    const baseRaw = WEIGHTS.CORRECTIONS.HEAD[head.employmentType];
    if (baseRaw) {
      const base = weights.get(`correction_head_${head.employmentType.toLowerCase()}`, baseRaw);
      const final = mul(base, head.educationMultiplier);
      contributions.push(final);
      rules.push(
        triggeredRule(
          'correction_head_employment',
          'rules.correction_head',
          `Head employment ${head.employmentType}`,
          'WEIGHTS.CORRECTIONS.HEAD',
          final,
          final
        )
      );
    }
  }

  for (const person of input.persons) {
    if (person.isSonContributor && !person.isPrisoner) {
      const empKey = sonEmploymentKey(person.employmentType);
      if (!empKey) continue;
  
      let table;
      if (!person.sonMarried && person.sonSameHouse) {
        table = WEIGHTS.CORRECTIONS.SON_SINGLE_SAME_HOUSE;
      } else if (person.sonMarried && person.sonSameHouse) {
        table = WEIGHTS.CORRECTIONS.SON_MARRIED_SAME_HOUSE;
      } else if (person.sonMarried && !person.sonSameHouse) {
        table = WEIGHTS.CORRECTIONS.SON_MARRIED_OUTSIDE_HOUSE;
      } else {
        continue;
      }
  
      const baseRaw = table[empKey];
      if (!baseRaw) continue;
      const base = toDecimal(baseRaw);
      const final = mul(base, person.educationMultiplier);
      contributions.push(final);
      rules.push(
        triggeredRule(
          'correction_son_contributor',
          'rules.correction_son',
          `Son contributor ${person.employmentType}`,
          'WEIGHTS.CORRECTIONS.SON',
          final,
          final
        )
      );
    } else if (!person.markedAsL4Processed && (person.role === 'SPOUSE' || person.role === 'INDEPENDENT') && !person.isPrisoner) {
      // Standard employment correction for Wife or Independent members who aren't son contributors
      if (person.employmentQuality && person.employmentQuality !== 'NONE') {
        const corrRaw = WEIGHTS.DEPENDENT_ADULT.EMPLOYMENT_CORRECTION[person.employmentQuality];
        if (corrRaw) {
          const corr = mul(corrRaw, person.educationMultiplier);
          contributions.push(corr);
          rules.push(
            triggeredRule(
              `correction_${person.role.toLowerCase()}_employment_${person.employmentQuality.toLowerCase()}_${person.id}`,
              `rules.correction_${person.role.toLowerCase()}_employment`,
              `${person.role} employment ${person.employmentQuality}`,
              'WEIGHTS.DEPENDENT_ADULT.EMPLOYMENT_CORRECTION',
              corr,
              corr
            )
          );
        }
      }
    }
  }

  if (input.hasFamilySupport) {
    const w = weights.get(
      'correction_family_support',
      WEIGHTS.CORRECTIONS.FAMILY_UNKNOWN_SUPPORT
    );
    contributions.push(w);
    rules.push(
      triggeredRule(
        'correction_family_support',
        'rules.correction_family_support',
        'Family unknown support',
        'WEIGHTS.CORRECTIONS.FAMILY_UNKNOWN_SUPPORT',
        w,
        w
      )
    );
  }

  if (input.hasFoodAid) {
    const w = weights.get('correction_food_aid', WEIGHTS.CORRECTIONS.FOOD_ASSISTANCE);
    contributions.push(w);
    rules.push(
      triggeredRule(
        'correction_food_aid',
        'rules.correction_food_aid',
        'Food assistance',
        'WEIGHTS.CORRECTIONS.FOOD_ASSISTANCE',
        w,
        w
      )
    );
  }

  if (input.bankAssetGrade) {
    const gradeRaw = WEIGHTS.CORRECTIONS.BANK_ASSETS[input.bankAssetGrade];
    if (gradeRaw) {
      const w = weights.get('correction_bank_assets', gradeRaw);
      contributions.push(w);
      rules.push(
        triggeredRule(
          'correction_bank_assets',
          'rules.correction_bank_assets',
          `Bank assets grade ${input.bankAssetGrade}`,
          'WEIGHTS.CORRECTIONS.BANK_ASSETS',
          w,
          w
        )
      );
    }
  }

  const rawTotal = contributions.length ? sum(contributions) : ZERO;
  const floorCap = toDecimal(LAYER_CAPS.L7_CORRECTIONS);
  const cappedScore = rawTotal.lessThan(floorCap) ? floorCap : rawTotal;

  const result = createLayerResult('L7', rawTotal, '0', rules, [], []);
  result.cappedScore = cappedScore;
  result.score = rawTotal;
  return result;
}

module.exports = { calculateL7 };
