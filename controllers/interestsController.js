const Interests = require("../models/Interests");

const formatInterests = (doc) => ({
  id: doc._id,
  householdMembers: doc.householdMembers,
  timeOutdoors: doc.timeOutdoors,
  occupation: doc.occupation,
  animalContact: doc.animalContact,
  housingAndAC: doc.housingAndAC,
  hobbies: doc.hobbies ?? [],
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

const buildPayload = (body) => ({
  householdMembers: body.householdMembers,
  timeOutdoors: body.timeOutdoors.trim(),
  occupation: body.occupation.trim(),
  animalContact: body.animalContact,
  housingAndAC: body.housingAndAC.trim(),
  hobbies: body.hobbies ?? [],
});

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

const listInterests = async (req, res, next) => {
  try {
    const docs = await Interests.find().sort({ updatedAt: -1 });
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
    res.status(201).json({ interests: formatInterests(doc) });
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
  listInterests,
  createInterests,
  replaceInterests,
  updateInterests,
  deleteInterests,
};
