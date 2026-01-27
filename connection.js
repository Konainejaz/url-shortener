const mongoose = require("mongoose");

// Connect to MongoDB with provided URL and options
const connectDB = async (url) => {
  if (!url) {
    throw new Error("Missing MONGODB_URI");
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (!global.__mongooseConnection) {
    global.__mongooseConnection = { promise: null };
  }

  if (global.__mongooseConnection.promise) {
    await global.__mongooseConnection.promise;
    return mongoose.connection;
  }

  const clientOptions = { 
    serverApi: { 
      version: '1', 
      strict: true, 
      deprecationErrors: true 
    } 
  };

  try {
    global.__mongooseConnection.promise = mongoose.connect(url, clientOptions);
    await global.__mongooseConnection.promise;
    console.log("Pinged your deployment. You successfully connected to MongoDB Atlas!");
  } catch (err) {
    console.error("Failed to connect to MongoDB Atlas", err);
    global.__mongooseConnection.promise = null;
    throw err;
  }
};

module.exports = connectDB;
