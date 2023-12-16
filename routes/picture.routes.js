const express = require("express");
const { validatePhoto } = require("../middlewares/verify.photo");
const { validateUserToken } = require("../middlewares/auth");

const { uploadPhoto } = require("../controllers/picture.controller");
const router = express.Router();

//picture routes
router.route("/upload").post(validateUserToken, validatePhoto, uploadPhoto);

module.exports = router;
