/**
 * Layer 5: Education
 *
 * Measures vulnerability from education status:
 * - Head-of-household education level
 * - School-age children enrollment & dropout risk
 *
 * Cap: LAYER_CAPS.L5_EDUCATION
 */

const { ZERO, toDecimal, add, mul } = require('../../../../shared/utils/decimal');
const { L5, LAYER_CAPS } = require('../../../../shared/constants/weights');
const { createLayerResult, triggeredRule, skippedRule } = require('../layer-result');

function calculateL5(dto) {
  const rules = [];
  const skipped = [];
  const warnings = [];
  let total = ZERO;

  const members = dto.members || [];

  // ── Head-of-household education level ──
  const head = members.find(m => m.role === 'HUSBAND' || m.role === 'WIFE') || members[0];

  if (head) {
    let pts, weightSrc;
    switch (head.educationLevel) {
      case 'NONE': pts = L5.HEAD_NONE; weightSrc = 'L5.HEAD_NONE'; break;
      case 'NURSERY': pts = L5.HEAD_NURSERY; weightSrc = 'L5.HEAD_NURSERY'; break;
      case 'PRIMARY': pts = L5.HEAD_PRIMARY; weightSrc = 'L5.HEAD_PRIMARY'; break;
      case 'PREPARATORY': pts = L5.HEAD_PREPARATORY; weightSrc = 'L5.HEAD_PREPARATORY'; break;
      case 'SECONDARY': pts = L5.HEAD_SECONDARY; weightSrc = 'L5.HEAD_SECONDARY'; break;
      case 'UNIVERSITY': pts = L5.HEAD_UNIVERSITY; weightSrc = 'L5.HEAD_UNIVERSITY'; break;
      default: pts = L5.HEAD_NONE; weightSrc = 'L5.HEAD_NONE'; break;
    }

    if (pts && !pts.isZero()) {
      rules.push(triggeredRule(
        'L5_HEAD_EDU', 
        'head_education', 
        `Head of household education level: ${head.educationLevel || 'NONE'}`, 
        weightSrc, 
        pts, 
        pts
      ));
      total = add(total, pts);
    } else {
      skipped.push(skippedRule('L5_HEAD_EDU', 'head_education', 'university level — no additional vulnerability'));
    }
  }

  // ── School-age children (6-18) ──
  const educationRecords = dto.educationRecords || [];
  const now = new Date();

  for (const member of members) {
    const age = member.age != null ? member.age : (member.birthDate ? Math.floor((now - new Date(member.birthDate)) / 31557600000) : null);
    if (age == null || age < 6 || age > 18) continue;

    // If they are marked as special education, skip scoring (calculate as 0 points) as per user requirements
    if (member.isSpecialEducation) {
      skipped.push(skippedRule('L5_SPECIAL_EDU', 'special_education', `Child is marked as special education: ${member.name}`));
      continue;
    }

    // Check education records for this member
    const memberRecords = educationRecords.filter(e => e.personId === member.id);

    if (memberRecords.length === 0) {
      // No enrollment record for school-age child
      rules.push(triggeredRule(
        'L5_NOT_ENROLLED', 
        'child_not_enrolled', 
        `School-age child not enrolled: ${member.name}`, 
        'L5.NOT_ENROLLED_PER_CHILD', 
        L5.NOT_ENROLLED_PER_CHILD, 
        L5.NOT_ENROLLED_PER_CHILD
      ));
      total = add(total, L5.NOT_ENROLLED_PER_CHILD);
    } else {
      // Check dropout risk or academic failure
      const hasDropoutRisk = memberRecords.some(e => e.overallGrade === 'FAIL' || e.isRepeating);
      if (hasDropoutRisk) {
        rules.push(triggeredRule(
          'L5_DROPOUT', 
          'dropout_risk', 
          `High dropout risk or repeating year: ${member.name}`, 
          'L5.DROPOUT_RISK_PER_CHILD', 
          L5.DROPOUT_RISK_PER_CHILD, 
          L5.DROPOUT_RISK_PER_CHILD
        ));
        total = add(total, L5.DROPOUT_RISK_PER_CHILD);
      }
    }
  }

  return createLayerResult('L5', total, LAYER_CAPS.L5_EDUCATION, rules, skipped, warnings);
}

module.exports = { calculateL5 };
