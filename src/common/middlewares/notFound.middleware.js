const { NotFoundError } = require('../common/errors');

const notFoundMiddleware = (req, _, next) => {
  next(new NotFoundError(`Cannot find ${req.originalUrl} on this server`));
};

module.exports = notFoundMiddleware;