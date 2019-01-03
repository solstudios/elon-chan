// winston logger

const logger = require('winston');

// winston logger
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
  colorize: true
});
logger.level = 'debug';

exports.logger = logger;