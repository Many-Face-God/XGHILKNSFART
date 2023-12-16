const passwordValidator = require("password-validator");
const responseHandler = require("../helpers/response");

const signinValidation = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return responseHandler(res, 401, "Invalid email or password");
  }
  next();
};

const validateConfirmPassword = (req, res, next) => {
  const user = req.body.user;
  if (!user) {
    return responseHandler(res, 400, "Bad request, User object not specified");
  }

  if (
    !user.firstName ||
    !user.lastName ||
    !user.phone ||
    !user.email ||
    !user.country ||
    !user.state
  ) {
    return responseHandler(res, 400, "Bad Request, fields cannot be empty");
  }

  if (
    user.firstName.trim().length < 3 ||
    user.lastName.trim().length < 3 ||
    user.state.trim().length < 3 ||
    user.country.trim().length < 3 ||
    user.phone.trim().length < 10
  ) {
    return responseHandler(
      res,
      400,
      "Bad Request, firstName, lastName, country, state, gender can't be less than 3 characters. Phone can't be less than 10 characters"
    );
  }

  if (user.password === user.confirmPassword) {
    next();
  } else {
    return responseHandler(
      res,
      400,
      "password and confirm password does not match"
    );
  }
};

const validatePassword = (req, res, next) => {
  const { password } = req.body.user;
  const schema = new passwordValidator();
  schema
    .is()
    .min(8)
    .has()
    .uppercase()
    .has()
    .lowercase()
    .has()
    .digits()
    .has()
    .not()
    .spaces();

  const validate = schema.validate(password);

  if (!validate) {
    return responseHandler(
      res,
      400,
      "Password must consist of atleast 8 characters, Uppercase, LowerCase, Number and contain no spaces"
    );
  } else {
    next();
  }
};

module.exports = {
  validateConfirmPassword,
  validatePassword,
  signinValidation,
};
