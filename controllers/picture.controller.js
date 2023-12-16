//Firebase Dependencies
const firebaseAdmin = require("firebase-admin");
const { v4: uuidv4 } = require("uuid");
const serviceAccount = require("../config/firebase_key.json");
const path = require("path");
const fs = require("fs");

//Initializing firebase
const proctAdmin = firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(serviceAccount),
});

//Storage Reference
const bucket = proctAdmin.storage().bucket(`gs://me-demo-proctor.appspot.com`);

const uploadFile = async (file, filename) => {
  return bucket.upload(file, {
    public: true,
    destination: `/uploads/proctorme/${filename}`,
    metadata: {
      firebaseStorgaeDownloadTokens: uuidv4(),
    },
  });
};

const uploadPhoto = async (req, res) => {
  var file;
  try {
    //get picture from files
    file = req.files.photo;

    var uuid = "" + uuidv4();
    file.name = `Img_${uuid}${path.parse(file.name).ext}`;

    const uploadFileFirebase = await uploadFile(file.tempFilePath, file.name);

    if (!uploadFileFirebase) {
      return res.status(500).json({ type: "failure", message: err.message });
    }

    deleteFile(file.tempFilePath);

    return res.status(200).json({
      type: "success",
      data: uploadFileFirebase[0].metadata.mediaLink,
    });
  } catch (err) {
    deleteFile(file.tempFilePath);
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: err.message,
    });
  }
};

module.exports = {
  uploadFile,
  uploadPhoto,
};

const deleteFile = (path) => {
  try {
    fs.unlinkSync(path);
  } catch (err) {
    console.log(err);
  }
};
