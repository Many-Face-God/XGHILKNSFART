const express = require("express");
const {
  markTheory,
  scoreTheoryQuestion,
} = require("../controllers/mark_theory.controller");
const {
  verifyMarkTheoryAccessControl,
  verifyScoreTheoryAccessControl,
} = require("../middlewares/verify.exam.priveleges");

const { validateUserToken, validateLoginJwt } = require("../middlewares/auth");

const router = express.Router();

router
  .route("/:theoryAnswerId/score")
  .put(
    validateUserToken,
    validateLoginJwt,
    verifyScoreTheoryAccessControl,
    scoreTheoryQuestion
  );

router
  .route("/candidates/:candidateId/mark")
  .put(
    validateUserToken,
    validateLoginJwt,
    verifyMarkTheoryAccessControl,
    markTheory
  );

module.exports = router;
