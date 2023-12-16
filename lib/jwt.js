const jwt = require("jsonwebtoken");
const { SchemaTypeOptions } = require("mongoose");

const jwtSign = (payload, SECRET, option = {}) => {
  return jwt.sign(payload, SECRET, option);
};

const jwtVerify = (token, SECRET) => {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    return false;
  }
};

module.exports = { jwtSign, jwtVerify };
