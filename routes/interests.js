const express = require("express");
const {
  validateCreateOrReplace,
  validatePartialUpdate,
} = require("../validators/interestsValidator");
const {
  getInterests,
  listInterests,
  createInterests,
  replaceInterests,
  updateInterests,
  deleteInterests,
} = require("../controllers/interestsController");

const router = express.Router();

router.get("/", listInterests);
router.post("/", validateCreateOrReplace, createInterests);
router.get("/:id", getInterests);
router.put("/:id", validateCreateOrReplace, replaceInterests);
router.patch("/:id", validatePartialUpdate, updateInterests);
router.delete("/:id", deleteInterests);

module.exports = router;
