/**
 * Scoring-specific typed application errors.
 * Extend the base AppError from utils/errors.js.
 */

const { AppError } = require('../utils/errors');

class ScoringEngineError extends AppError {
  constructor(message, details = null) {
    super(message, 500, 'SCORING_ENGINE_ERROR', details);
  }
}

class NormalizationError extends AppError {
  constructor(message, details = null) {
    super(message, 500, 'NORMALIZATION_ERROR', details);
  }
}

class RuleResolutionError extends AppError {
  constructor(message, details = null) {
    super(message, 500, 'RULE_RESOLUTION_ERROR', details);
  }
}

module.exports = {
  ScoringEngineError,
  NormalizationError,
  RuleResolutionError,
};
