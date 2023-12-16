const { uploadFile } = require("../controllers/picture.controller");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");

const uploadPhoto = async (req, res, next) => {
  var candidates = new Array();
  var candidate = {};

  if (
    !req.body.firstName ||
    !req.body.lastName ||
    !req.body.email ||
    !req.body.phone
  ) {
    return res
      .status(400)
      .json({ type: "failure", message: `Required fields can't be empty` });
  }

  if (req.exam.plan != "basic") {
    if (!req.files) {
      return res
        .status(400)
        .json({ type: "failure", message: `Please upload an image file` });
    }

    file = req.files.photo;

    // Check if the uploaded file is an image file
    if (!file.mimetype.startsWith("image")) {
      return res.status(400).json({
        type: "failure",
        message: "Please upload an image file",
      });
    }

    // Check if size is more than 2MB
    if (file.size > 2048 * 1024) {
      return res.status(400).json({
        type: "failure",
        message: "Please upload an image file that is less than 2mb",
      });
    }

    var uuid = "" + uuidv4();
    file.name = `Candidate_${req.body.firstName}_${uuid}${
      path.parse(file.name).ext
    }`;

    // upload file to firebase
    const uploadFileFirebase = await uploadFile(file.tempFilePath, file.name);

    if (!uploadFileFirebase) {
      return res.status(500).json({
        type: "failure",
        message: "Image upload to cloud storage failed ",
        error: err.message,
      });
    }
    let imageUrl = uploadFileFirebase[0].metadata.mediaLink;

    candidate.firstName = req.body.firstName;
    candidate.lastName = req.body.lastName;
    candidate.email = req.body.email;
    candidate.phone = req.body.phone;
    candidate.imageUrl = imageUrl;
  } else {
    candidate.firstName = req.body.firstName;
    candidate.lastName = req.body.lastName;
    candidate.email = req.body.email;
    candidate.phone = req.body.phone;
  }

  candidates.push(candidate);
  req.body.candidates = candidates;
  req.body.selfEnrollment = true;
  next();
};

module.exports = {
  uploadPhoto,
};
