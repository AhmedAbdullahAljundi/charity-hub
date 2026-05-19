const { toDecimal } = require('../../../../shared/utils/decimal');

/**
 * @param {number} age
 * @param {Array<{ maxAge: number, weight: string, ruleId?: string }>} bands
 */
function ageBand(age, bands) {
  for (const band of bands) {
    if (age <= band.maxAge) {
      return {
        weight: toDecimal(band.weight),
        ruleId: band.ruleId ?? null,
      };
    }
  }
  const last = bands[bands.length - 1];
  return { weight: toDecimal(last.weight), ruleId: last.ruleId ?? null };
}

module.exports = { ageBand };
