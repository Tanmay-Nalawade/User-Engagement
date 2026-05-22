const {
  MILESTONE_POINTS,
  MS_PER_DAY,
  CHECK_IN_WINDOW_MIN_DAYS,
  CHECK_IN_WINDOW_MAX_DAYS,
} = require("../constants/gamification");
const { MOCK_COUPONS } = require("../data/mockCoupons");
const { ensureDemoProfile } = require("../data/demoEngagement");

const daysSince = (fromDate, toDate = new Date()) => {
  if (!fromDate) return null;
  return (toDate - new Date(fromDate)) / MS_PER_DAY;
};

const getDisplayCoupons = (user) => {
  const location = user.location?.trim() || "Phoenix";
  const points = user.points ?? 0;

  return MOCK_COUPONS.map((coupon) => {
    const areaMatch =
      coupon.geographicArea === "Anywhere" ||
      coupon.geographicArea.toLowerCase() === location.toLowerCase() ||
      !location;

    const unlocked =
      points >= MILESTONE_POINTS || points >= (coupon.pointsCost ?? 0);

    return {
      ...coupon,
      locked: !unlocked,
      preview: areaMatch,
    };
  });
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
  points: user.points ?? 0,
  consecutiveWeeks: user.consecutiveWeeks ?? 0,
  lastCheckIn: user.lastCheckIn,
  location: user.location || "Phoenix",
  milestonePoints: MILESTONE_POINTS,
  milestoneUnlocked: (user.points ?? 0) >= MILESTONE_POINTS,
  interests: user.interests || null,
  demo: true,
});

const checkIn = async (req, res, next) => {
  try {
    const result = processCheckIn(req.user);
    await req.user.save();

    res.status(200).json({
      profile: formatUserProfile(req.user),
      checkIn: result,
      coupons: getDisplayCoupons(req.user),
    });
  } catch (error) {
    next(error);
  }
};

const getDashboard = async (req, res, next) => {
  try {
    await ensureDemoProfile(req.user);

    if (req.query.location) {
      req.user.location = String(req.query.location).trim() || "Phoenix";
      await req.user.save();
    }

    const coupons = getDisplayCoupons(req.user);

    res.status(200).json({
      profile: formatUserProfile(req.user),
      coupons,
      stats: {
        totalCoupons: coupons.length,
        unlockedCoupons: coupons.filter((c) => !c.locked).length,
        nearbyCoupons: coupons.filter((c) => c.preview).length,
      },
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
