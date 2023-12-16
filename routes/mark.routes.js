const Express = require("express");
const { validateUserToken, validateLoginJwt } = require("../middlewares/auth");
const {
  verifyExamIsCLosed,
  verifyUserPrevileges,
} = require("../middlewares/verify.exam.priveleges");
const { markExamExams } = require("../controllers/mark_exam.controller");

const router = Express.Router();

router.get(
  "/exams/:examId",
  validateUserToken,
  validateLoginJwt,
  verifyUserPrevileges,
  verifyExamIsCLosed,
  markExamExams
);

module.exports = router;
