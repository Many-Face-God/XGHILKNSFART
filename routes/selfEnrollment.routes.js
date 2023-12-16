const express = require("express");

const {
  candidatePhoneCheck,
  candidateEmailCheck,
  candidateExamCheck,
} = require("../controllers/candidateEnrollment.controller");
const { enrollCandidates } = require("../controllers/candidate.controller");
const {
  verifyExamIsScheduled,
  verifyCandidateSelfEnrollment,
} = require("../middlewares/verify.exam.priveleges");
const { uploadPhoto } = require("../middlewares/uploadPhoto");

const router = express.Router();

router.route("/").get((req, res) => {
  res.send(200);
});
router.route("/exam/:id/phone").get(candidatePhoneCheck);
router.route("/exam/:id/email").get(candidateEmailCheck);
router
  .route("/exam/:id")
  .get(
    verifyCandidateSelfEnrollment,
    verifyExamIsScheduled,
    candidateExamCheck
  );
router
  .route("/exam/:id/candidate")
  .post(
    verifyCandidateSelfEnrollment,
    verifyExamIsScheduled,
    uploadPhoto,
    enrollCandidates
  );

module.exports = router;
