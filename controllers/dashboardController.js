const {
  MILESTONE_POINTS,
  MS_PER_DAY,
  CHECK_IN_WINDOW_MIN_DAYS,
  CHECK_IN_WINDOW_MAX_DAYS,
} = require("../constants/gamification");
const { MOCK_COUPONS } = require("../data/mockCoupons");

const daysSince = (fromDate, toDate = new Date()) => {
  if (!fromDate) return null;
  return (toDate - new Date(fromDate)) / MS_PER_DAY;
};

/**
 * Derive coupon categories from the user's interests profile.
 */
const getInterestCategories = (interests) => {
  if (!interests) {
    return [];
  }

  const categories = new Set();

  (interests.hobbies || []).forEach((h) => categories.add(h));
  if (interests.animalContact) {
    categories.add("Pets");
  }
  if (interests.timeOutdoors) {
    categories.add("Outdoor");
  }
  if (interests.housingAndAC) {
    categories.add("Home");
  }
  const occupation = (interests.occupation || "").toLowerCase();
  if (occupation.includes("nurse") || occupation.includes("health")) {
    categories.add("Healthcare");
  }
  if (occupation.includes("teacher") || occupation.includes("education")) {
    categories.add("Education");
  }

  return [...categories];
};

const couponMatchesUser = (coupon, location, categories) => {
  const areaMatch =
    !location ||
    coupon.geographicArea.toLowerCase() === location.toLowerCase();

  const categoryMatch =
    categories.length === 0 ||
    categories.some(
      (cat) => cat.toLowerCase() === coupon.category.toLowerCase(),
    );

  return areaMatch && categoryMatch;
};

const getMatchingCoupons = (user) => {
  const location = user.location?.trim() || "";
  const categories = getInterestCategories(user.interests);

  let coupons = MOCK_COUPONS.filter((c) =>
    couponMatchesUser(c, location, categories),
  );

  if (coupons.length === 0) {
    coupons = MOCK_COUPONS.filter(
      (c) =>
        !location ||
        c.geographicArea.toLowerCase() === location.toLowerCase(),
    );
  }

  if (coupons.length === 0) {
    coupons = MOCK_COUPONS.slice(0, 5);
  }

  const unlocked = user.points >= MILESTONE_POINTS;

  return coupons.map((coupon) => ({
    ...coupon,
    locked: !unlocked,
  }));
};

const processCheckIn = (user) => {
  const now = new Date();
  const elapsedDays = daysSince(user.lastCheckIn, now);

  if (elapsedDays !== null && elapsedDays < CHECK_IN_WINDOW_MIN_DAYS) {
    const err = new Error(
      "You already checked in this week. Come back after 7 days.",
    );
    err.statusCode = 429;
    throw err;
  }

  let pointsEarned = 0;
  let message = "";
  let streakWeek = user.consecutiveWeeks;

  if (elapsedDays === null) {
    streakWeek = 1;
    pointsEarned = 10;
    message = "Welcome! Week 1 streak started — +10 points.";
  } else if (elapsedDays > CHECK_IN_WINDOW_MAX_DAYS) {
    streakWeek = 1;
    pointsEarned = 10;
    message = "Streak reset — missed a week. Starting fresh with +10 points.";
  } else {
    if (user.consecutiveWeeks === 1) {
      streakWeek = 2;
      pointsEarned = 10;
      message = "Week 2 consecutive check-in — +10 points!";
    } else if (user.consecutiveWeeks === 2) {
      streakWeek = 0;
      pointsEarned = 50;
      message = "Week 3 bonus! +50 points — streak cycle complete!";
    } else {
      streakWeek = 1;
      pointsEarned = 10;
      message = "New streak week — +10 points.";
    }
  }

  user.consecutiveWeeks = streakWeek;
  user.points += pointsEarned;
  user.lastCheckIn = now;

  return {
    pointsEarned,
    consecutiveWeeks: user.consecutiveWeeks,
    totalPoints: user.points,
    message,
    milestoneUnlocked: user.points >= MILESTONE_POINTS,
  };
};

const formatUserProfile = (user) => ({
  points: user.points,
  consecutiveWeeks: user.consecutiveWeeks,
  lastCheckIn: user.lastCheckIn,
  location: user.location || "",
  milestonePoints: MILESTONE_POINTS,
  milestoneUnlocked: user.points >= MILESTONE_POINTS,
  interests: user.interests || null,
});

const checkIn = async (req, res, next) => {
  try {
    const result = processCheckIn(req.user);
    await req.user.save();

    res.status(200).json({
      profile: formatUserProfile(req.user),
      checkIn: result,
    });
  } catch (error) {
    next(error);
  }
};

const getDashboard = async (req, res, next) => {
  try {
    if (req.query.location) {
      req.user.location = String(req.query.location).trim();
      await req.user.save();
    }

    const coupons = getMatchingCoupons(req.user);

    res.status(200).json({
      profile: formatUserProfile(req.user),
      coupons,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkIn,
  getDashboard,
  MILESTONE_POINTS,
};
