const express = require("express");
const { verify } = require("../controllers/verification.controller");

const router = express.Router();

router.route("/:token").get(verify);

module.exports = router;
