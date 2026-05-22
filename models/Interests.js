const mongoose = require("mongoose");

const interestsSchema = new mongoose.Schema(
  {
    householdMembers: {
      type: Number,
      min: 0,
      required: true,
    },
    timeOutdoors: {
      type: String,
      required: true,
      trim: true,
    },
    occupation: {
      type: String,
      required: true,
      trim: true,
    },
    animalContact: {
      type: Boolean,
      required: true,
    },
    animalTypes: {
      type: [String],
      default: [],
    },
    housingAndAC: {
      type: String,
      required: true,
      trim: true,
    },
    hobbies: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: "interests",
  },
);

module.exports = mongoose.model("Interests", interestsSchema);
