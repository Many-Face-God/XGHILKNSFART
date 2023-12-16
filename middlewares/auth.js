const jwt = require("jsonwebtoken");
const responseHandler = require("../helpers/response");
const config = require("../config/config");

const JWT_SECRET = config.jwtSecret;

const validateUserToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    let result;
    if (authHeader) {
      const authString = req.headers.authorization.trim();
      if (!authString) {
        return responseHandler(res, 403, "Authorization Header is missing");
      }
      const prefix = req.headers.authorization.split(" ")[0];
      if (
        prefix !== config.authPrefix &&
        prefix.length !== config.authPrefix.length
      ) {
        return responseHandler(res, 403, "Invalid Authorization Header");
      }
      const token = req.headers.authorization.split(" ")[1];
      result = await jwt.verify(token, JWT_SECRET);
      if (!result) {
        return responseHandler(
          res,
          403,
          "Invalid Authentication token, BAD REQUEST"
        );
      } else {
        req.decoded = result;
        next();
      }
    } else {
      return responseHandler(
        res,
        400,
        "Authorization header is required, BAD REQUEST"
      );
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: err.message,
    });
  }
};

const validateLoginJwt = async (req, res, next) => {
  try {
    const { type } = req.decoded;
    if (type === "Signin") {
      next();
    } else {
      return responseHandler(
        res,
        403,
        "Invalid Authorization token, please login"
      );
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

const validateForgotJwt = async (req, res, next) => {
  try {
    const { type } = req.decoded;
    if (type === "forgotPassword") {
      next();
    } else {
      return responseHandler(
        res,
        403,
        "Invalid Authorization token, you are already logged in"
      );
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      type: "failure",
      message: "Internal Server Error",
      error: err.message,
    });
  }
};

// const validateAdmin = async (req, res, next) => {
//   try {
//     const { role } = req.decoded;
//     if (role === "admin") {
//       next();
//     } else {
//       throw Error("You are not authorised to access this route", "", 401);
//     }
//   } catch (err) {
//     return responseHandler(res, "500", "Server Error");
//   }
// };

module.exports = { validateUserToken, validateLoginJwt, validateForgotJwt };
