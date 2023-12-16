const User = require("../models/user.model");
const Institution = require("../models/institution");
const sendMail = require("../helpers/sendVerificationMail");
const bcrypt = require("bcrypt");
const responseHandler = require("../helpers/response");
const { jwtSign } = require("../lib/jwt");
const config = require("../config/config");
const { uploadFile } = require("./picture.controller");
let emailVerificationTemplate = require("../public/emailVerification");
const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const { fetchedPlan } = require("./plan.controller");

module.exports.createUser = async (req, res) => {
  const { user, organisation } = req.body;
  const saltRounds = 12;
  let userData = { ...user };
  let institution = organisation ? { ...organisation } : null;

  userData.email = userData.email.toLowerCase();
  //check if institution is true
  if (institution) {
    institution.officialEmail = institution.officialEmail.toLowerCase();
    //check if institution exist in database
    const fetchedInstitution = await Institution.findOne({
      officialEmail: institution.officialEmail,
    });
    if (fetchedInstitution) {
      return responseHandler(res, 400, "Organisation Already Exist!");
    }
  }
  //check if user email exist
  const fetchedUser = await User.findOne({ email: userData.email });
  if (fetchedUser) {
    return responseHandler(res, 400, "User with email Already Exist!");
  }
  //check if user phone exist
  const storedUser = await User.findOne({ phone: userData.phone });
  if (storedUser) {
    return responseHandler(res, 400, "User with phone Already Exist!");
  }
  //delete confirm passeord
  delete userData.confirmPassword;
  try {
    const hash = await bcrypt.hash(userData.password, saltRounds);
    userData.password = hash;
    //create verification token
    const token = await jwtSign(
      { user: userData, institution },
      config.jwtSecret,
      { expiresIn: 60 * 40 }
    );
    let hostname = req.headers.host;
    let verificationLink = `https://${hostname}/verify/${token}`;
    // let msg = verificationTemplate(userData.firstname, verificationLink);
    let msg = emailVerificationTemplate(userData.firstName, verificationLink);
    const sent = await sendMail(
      msg,
      "Proctorme verification mail",
      userData.email
    );
    if (sent) {
      return res.status(200).json({
        type: "success",
        message: "Successfully signed up!",
      });
    } else {
      return res.status(500).json({
        type: "failure",
        message: "Mail not sent",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "Server Error!",
    });
  }
};

module.exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select([
      "-password",
      "-createdAt",
      "-updatedAt",
      "-isVerified",
    ]);
    // delete user.password;
    if (!user) {
      return res.status(404).json({
        type: "failure",
        message: "User Not found",
      });
    }

    return res.status(200).json({
      type: "success",
      message: " User retrieved successfully",
      data: user,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "Server error",
      error: err.message,
    });
  }
};

module.exports.updateUser = async (req, res) => {
  try {
    const user_id = req.params.id;

    let fetchedUser = await User.findOne({ _id: user_id });

    if (!fetchedUser) {
      res.status(404).json({
        type: "failure",
        message: "User not found",
      });
    }
    fetchedUser = await User.findByIdAndUpdate({ _id: user_id }, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      type: "success",
      message: "User updated Successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      type: "failure",
      message: "Internal Server error",
      error: err.message,
    });
  }
};

// login admin
exports.signIn = async (req, res) => {
  try {
    var { email, password } = req.body.user;
    // validate all the fields
    if (!email || !password) {
      return res.status(400).json({
        type: "failure",
        message: "Invalid email or password",
      });
    }

    email = email.toLowerCase();
    const fetchedUser = await User.findOne({ email });
    // verify email
    if (!fetchedUser) {
      return res.status(401).json({
        type: "failure",
        message: "Invalid Credentials!",
      });
    }
    // check if password match
    const isPasswordMatch = await bcrypt.compare(
      password,
      fetchedUser.password
    );
    if (!isPasswordMatch) {
      return res.status(401).json({
        type: "failure",
        message: "Invalid Credentials!",
      });
    }

    const plans = await fetchedPlan();
    if (typeof plans == "string") {
      return res.status(400).json({
        type: "failure",
        message: plans,
      });
    }

    // create jwt payload
    const payload = {
      id: fetchedUser._id,
      email: fetchedUser.email,
      role: fetchedUser.role,
      type: "Signin",
    };

    // create authentication token
    const token = await jwtSign(payload, config.jwtSecret, {
      expiresIn: "2h",
    });

    return res.status(200).json({
      type: "Success",
      user: {
        id: fetchedUser._id,
        lastName: fetchedUser.lastName,
        firstName: fetchedUser.firstName,
        imageUrl: fetchedUser.imageUrl,
        phone: fetchedUser.phone,
        email: fetchedUser.email,
        voucherQty: fetchedUser.voucherQty,
        plans: plans,
      },
      message: "User Logged in successfully",
      token: token,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

//update profile picture
module.exports.uploadPhoto = async (req, res) => {
  var file;
  try {
    const user_id = req.params.id;

    let fetchedUser = await User.findById(user_id);
    //Check if User exists
    if (!fetchedUser) {
      return res.status(404).json({
        type: "failure",
        message: "User not found",
      });
    }

    file = req.files.photo;
    var uuid = "" + uuidv4();
    file.name = `UserImage_${uuid}${path.parse(file.name).ext}`;

    // upload file to firebase
    const uploadFileFirebase = await uploadFile(file.tempFilePath, file.name);

    if (!uploadFileFirebase) {
      return res.status(500).json({
        type: "failure",
        message: "Upload to firebase failed",
        error: err.message,
      });
    }

    let imageUrl = uploadFileFirebase[0].metadata.mediaLink;
    // update user image url
    await User.findByIdAndUpdate(user_id, { imageUrl: imageUrl });

    deleteFile(file.tempFilePath);

    return res.status(200).json({
      type: "success",
      message: "profile picture updated successfully",
      imageUrl: imageUrl,
    });
  } catch (err) {
    deleteFile(file.tempFilePath);
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

//update password
module.exports.updatePassword = async (req, res) => {
  try {
    const { oldPassword, password, confirmPassword } = req.body;
    const user_id = req.params.id;
    const saltRounds = 12;

    // validate password fields
    if (!password && !confirmPassword) {
      return res.status(400).json({
        type: "failure",
        message: "please enter your new password",
      });
    }

    // check if confirm password is same as password
    if (password !== confirmPassword) {
      return res.status(400).json({
        type: "failure",
        message: "passwords don't match",
      });
    }

    //check if user exist
    const fetchedUser = await User.findById(user_id);

    //if not user
    if (!fetchedUser) {
      return res.status(400).json({
        type: "failure",
        message: "invalid user credentials!",
      });
    }

    // check if password match
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      fetchedUser.password
    );
    if (!isPasswordMatch) {
      return res.status(400).json({
        type: "failure",
        message:
          "Invalid Password Credentials!... please enter your current password as old password",
      });
    }

    //hash new password
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    fetchedUser.password = hashedPassword;

    //update password
    await fetchedUser.save();

    //return success message
    return res.status(200).json({
      type: "success",
      message: "Password updated successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

//search users by email

//delete profile picture

const deleteFile = (path) => {
  try {
    fs.unlinkSync(path);
  } catch (err) {
    console.log(err);
  }
};
