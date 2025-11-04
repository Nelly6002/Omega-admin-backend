// utils/logger.js

const logger = (req, res, next) => {
  const time = new Date().toISOString();
  console.log(`[${time}] ${req.method} ${req.originalUrl}`);
  
  next(); // pass control to next middleware/route
};

module.exports = logger;
