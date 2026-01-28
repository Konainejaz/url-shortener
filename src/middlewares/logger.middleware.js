const fs = require("fs");
const path = require("path");

function logRequests(filename = "server.log") {
  return (req, res, next) => {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} ${req.method} ${req.path} - ${req.ip}\n`;
    const logFile =
      process.env.LOG_FILE ||
      (process.env.VERCEL ? path.join("/tmp", path.basename(filename)) : filename);

    fs.appendFile(logFile, logEntry, (err) => {
      if (err) {
        console.error("Failed to write to log file:", err);
      }
    });

    console.log(logEntry.trim());
    next();
  };
}

module.exports = { logRequests };
