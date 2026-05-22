const User = require("../models/User");
const Interests = require("../models/Interests");
const { ensureDemoProfile } = require("../data/demoEngagement");

/** Loads or creates the single app engagement profile (no auth, no user id). */
const loadEngagement = async (req, res, next) => {
  try {
    let profile = await User.findOne().sort({ updatedAt: -1 });

    if (!profile) {
      profile = await User.create({});
    }

    await ensureDemoProfile(profile);

    const interestsDoc = await Interests.findOne().sort({ updatedAt: -1 });
    if (interestsDoc) {
      const synced = {
        householdMembers: interestsDoc.householdMembers,
        timeOutdoors: interestsDoc.timeOutdoors,
        occupation: interestsDoc.occupation,
        animalContact: interestsDoc.animalContact,
        animalTypes: interestsDoc.animalTypes,
        housingAndAC: interestsDoc.housingAndAC,
        hobbies: interestsDoc.hobbies,
      };
      const changed =
        JSON.stringify(profile.interests || null) !== JSON.stringify(synced);
      if (changed) {
        profile.interests = synced;
        await profile.save();
      }
    }

    req.user = profile;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { loadEngagement };
