const express = require("express");
const {
  ViewResultById,
  ViewResultByCandidateId,
  ViewResultByExamActivityId,
  ViewAllUserExams,
  ViewResultByExam,
  emailResults,
  emailResult,
} = require("../controllers/result.controller");

const { validateUserToken, validateLoginJwt } = require("../middlewares/auth");

const router = express.Router();

router
  .route("/:resultId")
  .get(validateUserToken, validateLoginJwt, ViewResultById);

router
  .route("/examActivities/:examActivityId")
  .get(validateUserToken, validateLoginJwt, ViewResultByExamActivityId);

router
  .route("/candidates/:candidateId")
  .get(validateUserToken, validateLoginJwt, ViewResultByCandidateId);

router.route("/").get(validateUserToken, validateLoginJwt, ViewAllUserExams);

router
  .route("/exams/:examId")
  .get(validateUserToken, validateLoginJwt, ViewResultByExam);

router
  .route("/exams/:examId/mail")
  .post(validateUserToken, validateLoginJwt, emailResults);

router
  .route("/:resultId/mail")
  .post(validateUserToken, validateLoginJwt, emailResult);

module.exports = router;
