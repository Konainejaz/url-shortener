const mongoose = require("mongoose");

// schema
const urlSchema = new mongoose.Schema(
  {
    shortID: { type: String, required: true, unique: true },
    originalUrl: { type: String, required: true },
    visitHistory: [
      {
        timestamp: { type: Date, default: Date.now },
        userAgent: { type: String },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "createdByType",
    },
    createdByType: {
      type: String,
      enum: ["User", "Admin"],
      required: true,
    },
  },
  { timestamps: true },
);
const URL = mongoose.model("URL", urlSchema);

module.exports = URL;
