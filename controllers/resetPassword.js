const User = require("../models/user.model");
const responseHandler = require("../helpers/response");
const bcrypt = require("bcrypt");
const Otp = require("../models/otp.model");
const UserLog = require("../models/userLog.model");

module.exports.verifyOtp = async (req, res) => {
  //get token from the request body
  const token = req.body.token;
  const user = req.decoded.id;
  try {
    // verify otp and user
    const otp = await Otp.findOne({
      otp: token,
      user: user,
      type: "password",
    });

    //can't find otp, return error
    if (!otp) {
      return responseHandler(res, 401, "otp token is invalid or expired");
    }

    await Otp.findByIdAndDelete(otp._id);

    //return success message with status 200
    return responseHandler(res, 200, "Otp successfully verified");
  } catch (err) {
    console.log(err);
    return responseHandler(
      res,
      500,
      "Internal Server Error... please check your error log"
    );
  }
};

module.exports.changePassword = async (req, res) => {
  const { password, confirmPassword } = req.body;
  const user = req.decoded.id;
  const saltRounds = 12;

  try {
    // validate password fields
    if (!password && !confirmPassword) {
      return responseHandler(res, 400, "please enter your new password");
    }

    // check if confirm password is equal to password
    if (password !== confirmPassword) {
      return responseHandler(res, 400, "passwords don't match");
    }

    //check if user exist
    const fetchedUser = await User.findById(user);

    //if not user
    if (!fetchedUser) {
      return responseHandler(res, 401, "invalid user credentials");
    }

    //hash new password
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    fetchedUser.password = hashedPassword;

    //update password
    await fetchedUser.save();

    let action = "Password changed using forgot password feature ";
    let userlog = await UserLog.create({ action, user });

    console.log(userlog);

    //return success message
    return responseHandler(res, 200, "Password reset successfully");
  } catch (err) {
    console.log(err);
    return responseHandler(res, 500, "Server Error");
  }
};
