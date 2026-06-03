const { ZERO, sum, toDecimal, add } = require('../../../../shared/utils/decimal');
const { WEIGHTS, LAYER_CAPS } = require('../../registry/weights');
const { createLayerResult, triggeredRule } = require('../utils/layer-helpers');

function gradeWeight(map, grade) {
  if (!grade || !map[grade]) return ZERO;
  return toDecimal(map[grade]);
}

function calculateL5(ctx) {
  const { input, weights } = ctx;
  const rules = [];
  const contributions = [];

  for (const burden of input.temporaryBurdens) {
    switch (burden.type) {
      case 'BRIDE': {
        const w = weights.get('burden_bride', WEIGHTS.BURDENS.BRIDE);
        contributions.push(w);
        rules.push(triggeredRule('burden_bride', 'rules.burden_bride', 'Bride burden', 'WEIGHTS.BURDENS.BRIDE', w, w));
        break;
      }

      case 'DEBT': {
        const w = gradeWeight(WEIGHTS.BURDENS.DEBT, burden.grade);
        if (!w.isZero()) {
          contributions.push(w);
          rules.push(
            triggeredRule(
              `burden_debt_${burden.grade}`,
              'rules.burden_debt',
              `Debt grade ${burden.grade}`,
              'WEIGHTS.BURDENS.DEBT',
              w,
              w
            )
          );
        }
        break;
      }
      case 'INJURY': {
        const w = gradeWeight(WEIGHTS.BURDENS.INJURY, burden.grade);
        if (!w.isZero()) {
          contributions.push(w);
          rules.push(
            triggeredRule(
              `burden_injury_${burden.grade}`,
              'rules.burden_injury',
              `Injury grade ${burden.grade}`,
              'WEIGHTS.BURDENS.INJURY',
              w,
              w
            )
          );
        }
        break;
      }
      case 'SURGERY': {
        const w = gradeWeight(WEIGHTS.BURDENS.SURGERY, burden.grade);
        if (!w.isZero()) {
          contributions.push(w);
          rules.push(
            triggeredRule(
              `burden_surgery_${burden.grade}`,
              'rules.burden_surgery',
              `Surgery grade ${burden.grade}`,
              'WEIGHTS.BURDENS.SURGERY',
              w,
              w
            )
          );
        }
        break;
      }
      default:
        break;
    }
  }

  const personBrides = input.persons.filter((p) => {
    const isSingle = p.maritalStatus == null || p.maritalStatus === 'SINGLE';
    return (
      p.gender === 'FEMALE' &&
      p.age >= 13 &&
      p.age <= 25 &&
      isSingle &&
      p.role === 'CHILD' &&
      p.isBride === true
    );
  });

  for (const bride of personBrides) {
    const base = weights.get('burden_bride', WEIGHTS.BURDENS.BRIDE);
    let brideScore = base;
    const ruleParts = ['person bride'];

    if (bride.brideHasSponsor) {
      const sponsor = weights.get('burden_bride_sponsor', WEIGHTS.BURDENS.BRIDE_SPONSOR);
      brideScore = add(brideScore, sponsor);
      ruleParts.push('sponsor correction');
    }

    contributions.push(brideScore);
    rules.push(
      triggeredRule(
        `burden_person_bride_${bride.id}`,
        'rules.burden_bride',
        `Bride ${bride.name || bride.id}: ${ruleParts.join(' + ')}`,
        'WEIGHTS.BURDENS.BRIDE',
        brideScore,
        brideScore
      )
    );
  }

  const prisoners = input.persons.filter((p) => p.isPrisoner && p.role !== 'HEAD');
  
  for (const prisoner of prisoners) {
    const base = weights.get('burden_son_in_prison', WEIGHTS.BURDENS.SON_IN_PRISON);
    contributions.push(base);
    rules.push(
      triggeredRule(
        `burden_person_prisoner_${prisoner.id}`,
        'rules.burden_prisoner',
        `Prisoner ${prisoner.name || prisoner.id}: base score 0.5`,
        'WEIGHTS.BURDENS.SON_IN_PRISON',
        base,
        base
      )
    );
  }

  if (!input.hasRationCard) {
    const w = weights.get('burden_no_ration_card', WEIGHTS.BURDENS.NO_RATION_CARD);
    contributions.push(w);
    rules.push(
      triggeredRule(
        'burden_no_ration_card',
        'rules.burden_no_ration',
        'No ration card',
        'WEIGHTS.BURDENS.NO_RATION_CARD',
        w,
        w
      )
    );
  }

  const total = contributions.length ? sum(contributions) : ZERO;
  return createLayerResult('L5', total, LAYER_CAPS.L5_BURDENS, rules, [], []);
}

module.exports = { calculateL5 };
