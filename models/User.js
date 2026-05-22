const mongoose = require("mongoose");

const interestsSchema = new mongoose.Schema(
  {
    householdMembers: Number,
    timeOutdoors: String,
    occupation: String,
    animalContact: Boolean,
    animalTypes: [String],
    housingAndAC: String,
    hobbies: [String],
  },
  { _id: false },
);

/** Single engagement profile (points, streak, coupons) — no login or user id. */
const engagementSchema = new mongoose.Schema(
  {
    points: {
      type: Number,
      default: 0,
      min: 0,
    },
    consecutiveWeeks: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastCheckIn: {
      type: Date,
      default: null,
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    interests: {
      type: interestsSchema,
      default: undefined,
    },
  },
  {
    timestamps: true,
    collection: "users",
  },
);

module.exports = mongoose.model("User", engagementSchema);
