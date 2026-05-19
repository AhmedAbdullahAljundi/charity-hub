const { NotFoundError } = require('../../../utils/errors');
const householdRepository = require('../repositories/household.repository');
const scoringRepository = require('../repositories/scoring.repository');
const { resolveAll } = require('../registry/ruleRegistry');
const { normalizeHousehold } = require('./normalizer');
const { runScoringEngine } = require('./engine');
const logger = require('../../../utils/logger');

/**
 * Full scoring lifecycle (load → normalize → score → persist).
 * @param {string} householdId
 * @param {{ persist?: boolean }} options
 */
async function runScoringPipeline(householdId, options = { persist: true }) {
  const raw = await householdRepository.findFullById(householdId);
  if (!raw) {
    throw new NotFoundError(`Household not found: ${householdId}`);
  }

  const input = normalizeHousehold(raw);
  const weights = await resolveAll();
  const result = runScoringEngine(input, { weights });

  logger.info(`Scoring engine ran for ${householdId}`, { executionMs: result.executionMs, finalScore: result.finalScore });

  if (options.persist !== false) {
    const saved = await scoringRepository.saveResult(householdId, result);
    return { ...result, scoreResultId: saved.id };
  }

  return result;
}

module.exports = { runScoringPipeline };
