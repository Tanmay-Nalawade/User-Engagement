const express = require("express");
const {
  validateCreate,
  validateReplaceById,
  validateUpsertByUser,
  validatePartialUpdate,
} = require("../validators/interestsValidator");
const {
  getInterests,
  getInterestsByUser,
  listInterests,
  createInterests,
  upsertInterestsByUser,
  replaceInterests,
  updateInterests,
  deleteInterests,
} = require("../controllers/interestsController");

const router = express.Router();

router.get("/user/:user", getInterestsByUser);
router.put("/user/:user", validateUpsertByUser, upsertInterestsByUser);
router.get("/", listInterests);
router.post("/", validateCreate, createInterests);
router.get("/:id", getInterests);
router.put("/:id", validateReplaceById, replaceInterests);
router.patch("/:id", validatePartialUpdate, updateInterests);
router.delete("/:id", deleteInterests);

module.exports = router;
