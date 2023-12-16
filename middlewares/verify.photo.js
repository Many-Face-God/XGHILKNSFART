const validatePhoto = async (req, res, next) => {
  // Check if a file is uploaded
  if (!req.files) {
    console.log("found");
    return res
      .status(400)
      .json({ type: "failure", message: `Please upload an image` });
  }

  const picture = req.files.photo;

  // Check if the uploaded file is an image file
  if (!picture.mimetype.startsWith("image")) {
    console.log(picture.mimetype);
    return res.status(400).json({
      type: "failure",
      message: "Please upload an image file",
    });
  }

  // Check if size is more than 2MB
  if (picture.size > 2048 * 1024) {
    console.log(picture.size);
    return res.status(400).json({
      type: "failure",
      message: "Please upload an image that is less than 2mb",
    });
  }
  next();
};

module.exports = {
  validatePhoto,
};
