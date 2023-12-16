const express = require("express");
const {
  getAllFlaggedAttemptByCandidateId,
  penalizeFlaggedAttempt,
  penalizeCandidateFlaggedAttempts,
  passClearFlag,
  passClearCandidateFlags,
  passClearExamFlags,
  ViewFlagById,
  ViewAllUserExams,
  ViewFlaggedExam,
} = require("../controllers/flag.controller");

const {
  verifyExamIsCLosed,
  verifyUserPrevileges,
} = require("../middlewares/verify.exam.priveleges");

const { validateUserToken, validateLoginJwt } = require("../middlewares/auth");

const router = express.Router();

router
  .route("/candidates/:candidateId")
  .get(validateUserToken, validateLoginJwt, getAllFlaggedAttemptByCandidateId);

router
  .route("/:flagId/penalize/")
  .put(validateUserToken, validateLoginJwt, penalizeFlaggedAttempt);

router
  .route("/candidates/:candidateId/penalize/")
  .put(validateUserToken, validateLoginJwt, penalizeCandidateFlaggedAttempts);

router
  .route("/:flagId/clear/")
  .put(validateUserToken, validateLoginJwt, passClearFlag);

router
  .route("/candidates/:candidateId/clear/")
  .put(validateUserToken, validateLoginJwt, passClearCandidateFlags);

router
  .route("/exams/:examId/clear/")
  .put(
    validateUserToken,
    validateLoginJwt,
    verifyUserPrevileges,
    verifyExamIsCLosed,
    passClearExamFlags
  );

router.route("/:flagId").get(validateUserToken, validateLoginJwt, ViewFlagById);

router
  .route("/users/exams")
  .get(validateUserToken, validateLoginJwt, ViewAllUserExams);

router
  .route("/exams/:examId")
  .get(validateUserToken, validateLoginJwt, ViewFlaggedExam);

module.exports = router;
