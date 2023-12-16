const express = require("express");
const { viewAllTransaction } = require("../controllers/transaction.controller");
const { validateLoginJwt, validateUserToken } = require("../middlewares/auth");

const router = express.Router();

router.route("/").get(validateUserToken, validateLoginJwt, viewAllTransaction);

module.exports = router;
