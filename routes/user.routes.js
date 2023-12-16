const express = require("express");
const {
  createUser,
  getUser,
  updateUser,
  signIn,
  uploadPhoto,
  updatePassword,
} = require("../controllers/user.controller");
const { validatePhoto } = require("../middlewares/verify.photo");
const { verifyUser } = require("../middlewares/verify.user");
const { changePassword, verifyOtp } = require("../controllers/resetPassword");

const forgetPassword = require("../controllers/forgotPassword");

const {
  validateUserToken,
  validateLoginJwt,
  validateForgotJwt,
} = require("../middlewares/auth");
const {
  validateConfirmPassword,
  validatePassword,
} = require("../middlewares/validation");

const router = express.Router();

router
  .route("/signup")
  .post(validateConfirmPassword, validatePassword, createUser);
router.route("/signin").post(signIn);
router.route("/forgot").post(forgetPassword);
router
  .route("/verifyOtp")
  .post(validateUserToken, validateForgotJwt, verifyOtp);
router
  .route("/reset")
  .post(validateUserToken, validateForgotJwt, changePassword);
router
  .route("/:id")
  .get(validateUserToken, validateLoginJwt, verifyUser, getUser);
router
  .route("/:id")
  .put(validateUserToken, validateLoginJwt, verifyUser, updateUser);
router
  .route("/:id/password")
  .put(validateUserToken, validateLoginJwt, updatePassword);
router
  .route("/:id/photo")
  .post(
    validateUserToken,
    validateLoginJwt,
    verifyUser,
    validatePhoto,
    uploadPhoto
  );
router
  .route("/:id/photo")
  .put(
    validateUserToken,
    validateLoginJwt,
    verifyUser,
    validatePhoto,
    uploadPhoto
  );

module.exports = router;
