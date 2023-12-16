const sendMail = require("../helpers/sendVerificationMail");
const User = require("../models/user.model");
const Otp = require("../models/otp.model");
const responseHandler = require("../helpers/response");
const { jwtSign } = require("../lib/jwt");
const config = require("../config/config");
let otpMailTemplate = require("../public/otpMail");
// let verificationTemplate = require("../helpers/verificationTemplate");

module.exports = async (req, res) => {
  const { email } = req.body;

  try {
    if (
      !email.includes("@") ||
      !email.includes(".") ||
      email.trim().length < 6 ||
      email.trim().startsWith("@") ||
      email.trim().startsWith(".")
    ) {
      return res.status(400).json({
        success: false,
        message: "BAD REQUEST!!!. Please enter a valid email",
      });
    }
    //check if email exist
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    //if email doesn't exist, return error
    if (!existingUser)
      return responseHandler(
        res,
        400,
        "User with email doesn't exist, please enter a registered email"
      );

    //generate five digit token
    let token = ("" + Math.random()).substring(2, 7);

    //check if user has an existing password otp
    await Otp.findOneAndDelete({
      user: existingUser._id,
      type: "password",
    });

    // if (otp) {
    //   await Otp.findByIdAndDelete(otp._id);
    // }

    // create otp
    const newOtp = await Otp.create({
      otp: token,
      type: "password",
      user: existingUser._id,
      expiry: Date.now() + (1000 * 60 + 30),
    });

    if (!newOtp) {
      throw new Error("Something went wrong... Failed to create new otp");
    }

    //create jwt token strictly for forgot password
    //create jwt payload
    const payload = {
      id: existingUser._id,
      type: "forgotPassword",
    };

    // // create jwt authentication token
    const jwtToken = await jwtSign(payload, config.jwtSecret, {
      expiresIn: "1h",
    });

    //prepare email template
    let msg = otpMailTemplate(existingUser.firstName, token);
    const sent = await sendMail(
      msg,
      `Reset Password Token`,
      existingUser.email
    );
    if (sent) {
      return res.status(200).json({
        type: "Success",
        message: "Reset token sent, please check your email",
        jwtToken: jwtToken,
        otp: newOtp,
      });
    } else {
      return res.status(500).json({
        type: "failure",
        message: "Mail not sent",
      });
    }
  } catch (err) {
    console.log(err);
    return responseHandler(
      res,
      500,
      "Internal Server Error... please check your error log"
    );
  }
};
