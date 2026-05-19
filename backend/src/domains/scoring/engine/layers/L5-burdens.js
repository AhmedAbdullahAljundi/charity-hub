const { ZERO, sum, toDecimal } = require('../../../../shared/utils/decimal');
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
      case 'SON_IN_PRISON': {
        const w = weights.get('burden_son_in_prison', WEIGHTS.BURDENS.SON_IN_PRISON);
        contributions.push(w);
        rules.push(
          triggeredRule(
            'burden_son_in_prison',
            'rules.burden_son_in_prison',
            'Son in prison',
            'WEIGHTS.BURDENS.SON_IN_PRISON',
            w,
            w
          )
        );
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

  const bridePerson = input.persons.find((p) => p.isBride);
  if (bridePerson?.brideHasSponsor) {
    const w = weights.get('burden_bride_sponsor', WEIGHTS.BURDENS.BRIDE_SPONSOR);
    contributions.push(w);
    rules.push(
      triggeredRule(
        'burden_bride_sponsor',
        'rules.burden_bride_sponsor',
        'Bride has sponsor',
        'WEIGHTS.BURDENS.BRIDE_SPONSOR',
        w,
        w
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
