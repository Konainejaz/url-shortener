const mongoose = require("mongoose");

const connectDB = async (url) => {
  if (!url) {
    throw new Error("MongoDB connection string is required");
  }

  const cached = global.__mongooseCache || (global.__mongooseCache = { conn: null, promise: null });
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(url, { serverSelectionTimeoutMS: 5000 });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

module.exports = connectDB;
