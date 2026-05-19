const { NotFoundError } = require('../../utils/errors');
const householdRepository = require('../../domains/scoring/repositories/household.repository');
const { normalizeHousehold } = require('../../domains/scoring/engine/normalizer');
const { runScoringEngine } = require('../../domains/scoring/engine/engine');
const { resolveAll } = require('../../domains/scoring/registry/ruleRegistry');
const { assertHouseholdAccessById } = require('../../shared/householdAccess');
const { toDecimal } = require('../../shared/utils/decimal');

function applyModifications(input, modifications) {
  const clone = JSON.parse(JSON.stringify(input));

  for (const mod of modifications || []) {
    const { field, value } = mod;
    if (field === 'housingType') {
      clone.housingType = value;
      continue;
    }
    if (field.startsWith('income.')) {
      const channel = field.split('.')[1];
      const src = clone.incomeSources.find((s) => s.channel === channel);
      if (src) {
        src.monthlyAmount = toDecimal(value);
      } else {
        clone.incomeSources.push({
          channel,
          monthlyAmount: toDecimal(value),
          verified: false,
        });
      }
      continue;
    }
    const personMatch = field.match(/^person\.([^.]+)\.(.+)$/);
    if (personMatch) {
      const [, personId, prop] = personMatch;
      const person = clone.persons.find((p) => p.id === personId);
      if (person) person[prop] = value;
      continue;
    }
    if (field === 'hasRationCard') clone.hasRationCard = value === true || value === 'true';
    if (field === 'hasFamilySupport') clone.hasFamilySupport = value === true || value === 'true';
    if (field === 'hasFoodAid') clone.hasFoodAid = value === true || value === 'true';
  }

  return clone;
}

function layerDelta(original, simulated) {
  const affected = [];
  const origMap = new Map((original.layerBreakdown || []).map((l) => [l.layerId, l.cappedScore]));
  for (const layer of simulated.layerBreakdown || []) {
    const before = origMap.get(layer.layerId) || '0';
    if (before !== layer.cappedScore) {
      affected.push({
        layerId: layer.layerId,
        before,
        after: layer.cappedScore,
      });
    }
  }
  return affected;
}

const simulateService = {
  async run(user, { householdId, modifications }) {
    await assertHouseholdAccessById(user, householdId);
    const raw = await householdRepository.findFullById(householdId);
    if (!raw) throw new NotFoundError('Household');

    const baseInput = normalizeHousehold(raw);
    const weights = await resolveAll();

    const original = runScoringEngine(baseInput, { weights });
    const modifiedInput = applyModifications(baseInput, modifications);
    const simulated = runScoringEngine(modifiedInput, { weights });

    const origPct = parseFloat(original.normalizedPercent.toString());
    const simPct = parseFloat(simulated.normalizedPercent.toString());

    return {
      originalScore: {
        finalScore: original.finalScore.toString(),
        normalizedPercent: origPct,
        systemRecommendation: original.systemRecommendation,
      },
      simulatedScore: {
        finalScore: simulated.finalScore.toString(),
        normalizedPercent: simPct,
        systemRecommendation: simulated.systemRecommendation,
      },
      scoreDelta: simPct - origPct,
      affectedLayers: layerDelta(original, simulated),
      explanation: {
        topPositiveFactors: simulated.topPositiveFactors,
        topNegativeFactors: simulated.topNegativeFactors,
        warnings: simulated.warnings,
        recommendations: simulated.recommendations,
      },
    };
  },
};

module.exports = simulateService;
