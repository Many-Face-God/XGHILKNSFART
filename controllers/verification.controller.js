const User = require("../models/user.model");
const Institution = require("../models/institution");
const bcrypt = require("bcrypt");
const { jwtVerify } = require("../lib/jwt");
const config = require("../config/config");
const sendMail = require("../helpers/sendVerificationMail");
let welcomeTemplate = require("../public/welcomeMail");

const verify = async (req, res) => {
  const token = req.params.token;
  const payload = jwtVerify(token, config.jwtSecret);
  try {
    if (payload.user) {
      // check if email already exist
      var checkUser = await User.exists({
        email: payload.user.email.toLowerCase(),
      });
      if (checkUser) {
        return res.status(400).json({
          info: {
            success: false,
            message: `user with email ${payload.user.email} already exists`,
          },
        });
      }

      // check if phone already exist
      checkUser = await User.exists({ phone: payload.user.phone });
      if (checkUser) {
        return res.status(400).json({
          info: {
            success: false,
            message: `User with phone number ${payload.user.phone} already exists`,
          },
        });
      }
      const user = await User.create(payload.user);
      if (payload.institution) {
        const institution = { ...payload.institution };
        institution.owner = user._id;
        await Institution.create(institution);
      }
      // Send mail
      const isSent = await sendMail(
        welcomeTemplate(payload.user.firstName),
        `Welcome to Proctorme, ${payload.user.firstName}`,
        payload.user.email
      );
      if (isSent) {
        return res.sendFile(process.cwd() + "/public/verified.html");
      }

      return res.sendFile(process.cwd() + "/public/verified.html");
    } else {
      return res.status("401").json({
        error: "verification failed link expired pls register again",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status("500").json({
      type: "failure",
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

module.exports = { verify };
