const Interests = require("../models/Interests");

const formatInterests = (doc) => ({
  id: doc._id,
  user: doc.user ?? null,
  householdMembers: doc.householdMembers,
  timeOutdoors: doc.timeOutdoors,
  occupation: doc.occupation,
  animalContact: doc.animalContact,
  animalTypes: doc.animalTypes ?? [],
  housingAndAC: doc.housingAndAC,
  hobbies: doc.hobbies ?? [],
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

const buildPayload = (body) => {
  const payload = {
    householdMembers: body.householdMembers,
    timeOutdoors: body.timeOutdoors.trim(),
    occupation: body.occupation.trim(),
    animalContact: body.animalContact,
    animalTypes: body.animalContact ? (body.animalTypes ?? []) : [],
    housingAndAC: body.housingAndAC.trim(),
    hobbies: body.hobbies ?? [],
  };

  if (body.user !== undefined && body.user !== null && String(body.user).trim()) {
    payload.user = String(body.user).trim();
  }

  return payload;
};

const getInterests = async (req, res, next) => {
  try {
    const doc = await Interests.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: "Interests not found" });
    }
    res.status(200).json({ interests: formatInterests(doc) });
  } catch (error) {
    next(error);
  }
};

const getInterestsByUser = async (req, res, next) => {
  try {
    const user = req.params.user.trim();
    const doc = await Interests.findOne({ user }).sort({ updatedAt: -1 });
    if (!doc) {
      return res.status(404).json({ error: "Interests not found for this user" });
    }
    res.status(200).json({ interests: formatInterests(doc) });
  } catch (error) {
    next(error);
  }
};

const listInterests = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.user) {
      filter.user = String(req.query.user).trim();
    }

    const docs = await Interests.find(filter).sort({ updatedAt: -1 });
    res.status(200).json({
      interests: docs.map(formatInterests),
    });
  } catch (error) {
    next(error);
  }
};

const createInterests = async (req, res, next) => {
  try {
    const doc = await Interests.create(buildPayload(req.body));
    console.log(`Created interests ${doc._id}`);
    res.status(201).json({ interests: formatInterests(doc) });
  } catch (error) {
    next(error);
  }
};

const upsertInterestsByUser = async (req, res, next) => {
  try {
    const user = req.params.user.trim();
    const doc = await Interests.findOneAndUpdate(
      { user },
      { ...buildPayload(req.body), user },
      { new: true, upsert: true, runValidators: true },
    );
    console.log(`Saved interests ${doc._id} for user ${user}`);
    res.status(200).json({ interests: formatInterests(doc) });
  } catch (error) {
    next(error);
  }
};

const replaceInterests = async (req, res, next) => {
  try {
    const doc = await Interests.findByIdAndUpdate(
      req.params.id,
      buildPayload(req.body),
      { new: true, runValidators: true },
    );
    if (!doc) {
      return res.status(404).json({ error: "Interests not found" });
    }
    res.status(200).json({ interests: formatInterests(doc) });
  } catch (error) {
    next(error);
  }
};

const updateInterests = async (req, res, next) => {
  try {
    const updates = {};

    if (req.body.user !== undefined) {
      updates.user = req.body.user?.trim() || null;
    }
    if (req.body.householdMembers !== undefined) {
      updates.householdMembers = req.body.householdMembers;
    }
    if (req.body.timeOutdoors !== undefined) {
      updates.timeOutdoors = req.body.timeOutdoors.trim();
    }
    if (req.body.occupation !== undefined) {
      updates.occupation = req.body.occupation.trim();
    }
    if (req.body.animalContact !== undefined) {
      updates.animalContact = req.body.animalContact;
    }
    if (req.body.animalTypes !== undefined) {
      updates.animalTypes = req.body.animalTypes;
    }
    if (req.body.animalContact === false) {
      updates.animalTypes = [];
    }
    if (req.body.housingAndAC !== undefined) {
      updates.housingAndAC = req.body.housingAndAC.trim();
    }
    if (req.body.hobbies !== undefined) {
      updates.hobbies = req.body.hobbies;
    }

    const doc = await Interests.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return res.status(404).json({ error: "Interests not found" });
    }

    res.status(200).json({ interests: formatInterests(doc) });
  } catch (error) {
    next(error);
  }
};

const deleteInterests = async (req, res, next) => {
  try {
    const doc = await Interests.findByIdAndDelete(req.params.id);
    if (!doc) {
      return res.status(404).json({ error: "Interests not found" });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInterests,
  getInterestsByUser,
  listInterests,
  createInterests,
  upsertInterestsByUser,
  replaceInterests,
  updateInterests,
  deleteInterests,
};
