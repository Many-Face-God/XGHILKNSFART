const express = require("express");
const { validateUserToken, validateLoginJwt } = require("../middlewares/auth");
const { validatePhoto } = require("../middlewares/verify.photo");
const {
  verifyPrevileges,
  verifyExamIsCLosed,
  verifyExamIsNotActiveOrClosed,
  verifyUserPrevileges,
  verifyExamPlanIsSelected,
} = require("../middlewares/verify.exam.priveleges");
const { validateSpreadSheet } = require("../middlewares/verify.spreadsheet");
const {
  scheduleExams,
  createExam,
  getExams,
  viewExamSpecificDetails,
  archiveExam,
  deleteExam,
  editExam,
} = require("../controllers/exam.controller");
const {
  createQuestions,
  viewAllQuestions,
  viewQuestion,
  updateQuestion,
  updateQuestionImage,
  deleteAllQuestions,
  deleteQuestion,
  updateTheoryQuestion,
} = require("../controllers/question.controller");
const {
  enrollCandidates,
  viewAllCandidates,
  viewCandidateProfile,
  updateCandidateProfile,
  updateCandidateImage,
  deleteAllCandidates,
  deleteSelectedCandidates,
  deleteCandidate,
  readExcelFile,
  enrollCandidatesFromSheet,
} = require("../controllers/candidate.controller");
const router = express.Router();

//exam route
router
  .route("/:id/schedule")
  .put(validateUserToken, validateLoginJwt, verifyPrevileges, scheduleExams);
router.route("/").post(validateUserToken, validateLoginJwt, createExam);
router.route("/").get(validateUserToken, validateLoginJwt, getExams);
router
  .route("/:id")
  .get(validateUserToken, validateLoginJwt, viewExamSpecificDetails);

router
  .route("/:examId")
  .put(
    validateUserToken,
    validateLoginJwt,
    verifyExamIsNotActiveOrClosed,
    verifyUserPrevileges,
    editExam
  );

router
  .route("/:examId/archive")
  .put(
    validateUserToken,
    validateLoginJwt,
    verifyExamIsCLosed,
    verifyUserPrevileges,
    archiveExam
  );

router
  .route("/:examId")
  .delete(
    validateUserToken,
    validateLoginJwt,
    verifyExamIsNotActiveOrClosed,
    verifyUserPrevileges,
    deleteExam
  );

// Question Routes
router
  .route("/:id/questions")
  .post(validateUserToken, validateLoginJwt, verifyPrevileges, createQuestions);
router
  .route("/:examId/questions")
  .get(
    validateUserToken,
    validateLoginJwt,
    verifyUserPrevileges,
    viewAllQuestions
  );
// router
//   .route("/:examId/questions")
//   .delete(
//     validateUserToken,
//     validateLoginJwt,
//     verifyPrevileges,
//     deleteAllQuestions
//   );
// router
//   .route("/:examId/questions/:questionId")
//   .get(validateUserToken, validateLoginJwt, verifyUserPrevileges, viewQuestion);
router
  .route("/:id/questions/:questionId")
  .delete(
    validateUserToken,
    validateLoginJwt,
    verifyPrevileges,
    deleteQuestion
  );
router
  .route("/:id/questions/:questionId")
  .put(validateUserToken, validateLoginJwt, verifyPrevileges, updateQuestion);

router
  .route("/:id/questions/theory/:questionId")
  .put(
    validateUserToken,
    validateLoginJwt,
    verifyPrevileges,
    updateTheoryQuestion
  );

// router
//   .route("/:id/questions/:questionId/photo")
//   .put(
//     validateUserToken,
//     validateLoginJwt,
//     verifyPrevileges,
//     validatePhoto,
//     updateQuestionImage
//   );

//Candidate Routes
router
  .route("/:id/candidates")
  .post(
    validateUserToken,
    validateLoginJwt,
    verifyPrevileges,
    verifyExamPlanIsSelected,
    enrollCandidates
  );
router
  .route("/:id/candidates")
  .delete(
    validateUserToken,
    validateLoginJwt,
    verifyPrevileges,
    deleteAllCandidates
  );
router
  .route("/:id/candidates/selected")
  .delete(
    validateUserToken,
    validateLoginJwt,
    verifyPrevileges,
    deleteSelectedCandidates
  );
router
  .route("/:examId/candidates")
  .get(
    validateUserToken,
    validateLoginJwt,
    verifyUserPrevileges,
    viewAllCandidates
  );
router
  .route("/:id/candidates/:candidateId")
  .put(
    validateUserToken,
    validateLoginJwt,
    verifyPrevileges,
    updateCandidateProfile
  );
router
  .route("/:examId/candidates/:candidateId")
  .get(
    validateUserToken,
    validateLoginJwt,
    verifyUserPrevileges,
    viewCandidateProfile
  );
router
  .route("/:id/candidates/:candidateId")
  .delete(
    validateUserToken,
    validateLoginJwt,
    verifyPrevileges,
    deleteCandidate
  );
router
  .route("/:id/candidates/:candidateId/photo")
  .put(
    validateUserToken,
    validateLoginJwt,
    verifyPrevileges,
    validatePhoto,
    updateCandidateImage
  );

router
  .route("/:id/candidates/excel")
  .post(validateUserToken, validateLoginJwt, verifyPrevileges, readExcelFile);

// router
//   .route("/:id/candidates/export/excel")
//   .get(
//     validateUserToken,
//     validateLoginJwt,
//     verifyPrevileges,
//     exportCandidatesList
//   );

router
  .route("/:id/candidates/sheet")
  .post(
    validateUserToken,
    validateLoginJwt,
    verifyPrevileges,
    validateSpreadSheet,
    enrollCandidatesFromSheet
  );
module.exports = router;
