// utils/logger.js
const fs = require("fs");
const path = require("path");

// Path for saving logs inside utils/logs/
const logFile = path.join(__dirname, "logs", "app.log");

// Ensure logs folder exists
if (!fs.existsSync(path.dirname(logFile))) {
  fs.mkdirSync(path.dirname(logFile));
}

// Helper to write logs to file + console
function writeLog(level, message) {
  const time = new Date().toISOString();
  const logEntry = `[${time}] ${level.toUpperCase()}: ${message}\n`;

  // Print to console
  console.log(logEntry.trim());

  // Save to file
  fs.appendFileSync(logFile, logEntry);
}

// Middleware: log every request
const requestLogger = (req, res, next) => {
  const userId = req.user ? req.user.id : "Guest";
  writeLog("request", `${req.method} ${req.originalUrl} by ${userId}`);
  next();
};

// Log successful actions (for auditing)
function logAction(userId, action, details = "") {
  writeLog("action", `User:${userId} | ${action} | ${details}`);
}

// Log errors
function logError(userId, error) {
  writeLog("error", `User:${userId} | ${error}`);
}

module.exports = {
  requestLogger,
  logAction,
  logError
};
