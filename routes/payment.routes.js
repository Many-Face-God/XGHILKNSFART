const express = require("express");
const {
  viewAllPayment,
  createPayment,
} = require("../controllers/payment.controller");
const { validateLoginJwt, validateUserToken } = require("../middlewares/auth");

const router = express.Router();

router.route("/").get(validateUserToken, validateLoginJwt, viewAllPayment);

router
  .route("/verify/:reference")
  .post(validateUserToken, validateLoginJwt, createPayment);

module.exports = router;
