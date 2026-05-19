const config = require('../config/env');

const formatLog = (level, message, meta = {}) => {
  return JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
    env: config.app.env
  });
};

const logger = {
  info: (msg, meta) => console.log(formatLog('INFO', msg, meta)),
  warn: (msg, meta) => console.warn(formatLog('WARN', msg, meta)),
  error: (msg, meta) => console.error(formatLog('ERROR', msg, meta)),
  debug: (msg, meta) => {
    if (config.app.env === 'development') {
      console.debug(formatLog('DEBUG', msg, meta));
    }
  }
};

module.exports = logger;
