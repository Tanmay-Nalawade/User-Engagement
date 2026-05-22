const HOUSING_OPTIONS = ["AC", "Swamp Cooler", "None"];

const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const validateHobbies = (hobbies) => {
  if (!Array.isArray(hobbies)) {
    return "hobbies must be an array of strings";
  }

  const invalid = hobbies.some((h) => typeof h !== "string");
  if (invalid) {
    return "hobbies must be an array of strings";
  }

  return null;
};

const validateInterestsBody = (body, { partial = false } = {}) => {
  const errors = [];
  const fields = [
    "householdMembers",
    "timeOutdoors",
    "occupation",
    "animalContact",
    "housingAndAC",
    "hobbies",
  ];

  if (!partial) {
    for (const field of fields) {
      if (body[field] === undefined) {
        errors.push(`${field} is required`);
      }
    }
  } else if (!fields.some((field) => body[field] !== undefined)) {
    errors.push("At least one interest field must be provided");
  }

  if (body.householdMembers !== undefined) {
    if (
      typeof body.householdMembers !== "number" ||
      !Number.isInteger(body.householdMembers) ||
      body.householdMembers < 0
    ) {
      errors.push("householdMembers must be a non-negative integer");
    }
  }

  if (body.timeOutdoors !== undefined && !isNonEmptyString(body.timeOutdoors)) {
    errors.push("timeOutdoors must be a non-empty string");
  }

  if (body.occupation !== undefined && !isNonEmptyString(body.occupation)) {
    errors.push("occupation must be a non-empty string");
  }

  if (
    body.animalContact !== undefined &&
    typeof body.animalContact !== "boolean"
  ) {
    errors.push("animalContact must be a boolean");
  }

  if (body.housingAndAC !== undefined) {
    if (!isNonEmptyString(body.housingAndAC)) {
      errors.push("housingAndAC must be a non-empty string");
    } else if (!HOUSING_OPTIONS.includes(body.housingAndAC.trim())) {
      errors.push(
        `housingAndAC must be one of: ${HOUSING_OPTIONS.join(", ")}`,
      );
    }
  }

  if (body.hobbies !== undefined) {
    const hobbyError = validateHobbies(body.hobbies);
    if (hobbyError) {
      errors.push(hobbyError);
    }
  }

  return errors;
};

const validateCreateOrReplace = (req, res, next) => {
  const errors = validateInterestsBody(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }
  next();
};

const validatePartialUpdate = (req, res, next) => {
  const errors = validateInterestsBody(req.body, { partial: true });
  if (errors.length > 0) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }
  next();
};

module.exports = {
  HOUSING_OPTIONS,
  validateCreateOrReplace,
  validatePartialUpdate,
};
