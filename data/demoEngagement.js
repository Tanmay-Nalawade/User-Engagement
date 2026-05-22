/** Default engagement stats so the dashboard is never empty on first visit. */
const DEMO_PROFILE_DEFAULTS = {
  points: 95,
  consecutiveWeeks: 2,
  location: "Phoenix",
  lastCheckIn: () => {
    const d = new Date();
    d.setDate(d.getDate() - 8);
    return d;
  },
  interests: {
    householdMembers: 3,
    timeOutdoors: "1-2 hours daily",
    occupation: "Nurse",
    animalContact: true,
    animalTypes: ["Dogs"],
    housingAndAC: "AC",
    hobbies: ["hiking", "gardening"],
  },
};

const ensureDemoProfile = async (profile) => {
  let changed = false;

  if (profile.points == null || profile.points === 0) {
    profile.points = DEMO_PROFILE_DEFAULTS.points;
    changed = true;
  }
  if (!profile.consecutiveWeeks) {
    profile.consecutiveWeeks = DEMO_PROFILE_DEFAULTS.consecutiveWeeks;
    changed = true;
  }
  if (!profile.location?.trim()) {
    profile.location = DEMO_PROFILE_DEFAULTS.location;
    changed = true;
  }
  if (!profile.lastCheckIn) {
    profile.lastCheckIn = DEMO_PROFILE_DEFAULTS.lastCheckIn();
    changed = true;
  }
  if (!profile.interests) {
    profile.interests = DEMO_PROFILE_DEFAULTS.interests;
    changed = true;
  }

  if (changed) {
    await profile.save();
  }

  return profile;
};

module.exports = { DEMO_PROFILE_DEFAULTS, ensureDemoProfile };
