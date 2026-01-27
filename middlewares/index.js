const fs = require("fs");
const User = require("../models/users");
const { toastMessageView } = require("../views/users");

const checkEmailExists = async (req, res, next) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(409).send(toastMessageView("Email already exists", "error"));
    }
    next();
  } catch (err) {
    console.error("Error checking email:", err);
    res.status(500).send(toastMessageView("Failed to check email", "error"));
  }
};

const checkEmailExistsExceptCurrent = async (req, res, next) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      // If updating a user (req.params.id exists), allow if it's the same user
      if (req.params.id) {
        const currentUserId = parseInt(req.params.id, 10);
        // If the email belongs to the current user being updated, allow it
        if (existingUser.id === currentUserId) {
          return next();
        }
      }
      // Different user has this email - reject
      return res.status(409).send(toastMessageView("This Email is already assigned to another user. Email already exists", "error"));
    }
    next();
  } catch (err) {
    console.error("Error checking email:", err);
    res.status(500).send(toastMessageView("Failed to check email", "error"));
  }
};

function serverLogs(filename) {
  return (req, res, next) => {
    const timestamp = new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    if (!process.env.VERCEL) {
      fs.appendFile(
        filename || "server.log",
        `${timestamp} ${req.method.toUpperCase()} ${req.path} ${req.ip}\n`,
        { encoding: "utf8", flag: "a" },
        (err) => {
          if (err) console.error("Could not create log file:", err);
        },
      );
    }
    console.log(
      `${timestamp} ${req.method.toUpperCase()} ${req.path} ${req.ip}\n`,
    );
    next();
  };
}

module.exports = { checkEmailExists, checkEmailExistsExceptCurrent, serverLogs };
