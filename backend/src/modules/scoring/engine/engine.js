/**
 * Scoring engine facade — delegates to Phase 2 domains/scoring implementation.
 */

const { runScoringEngine } = require('../../../domains/scoring/engine/engine');
const { runScoringPipeline } = require('../../../domains/scoring/engine/pipeline');
const { normalizeHousehold } = require('../../../domains/scoring/engine/normalizer');

module.exports = {
  runScoringEngine,
  runScoringPipeline,
  normalizeHousehold,
};
