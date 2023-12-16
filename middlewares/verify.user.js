const verifyUser = async (req, res, next) => {
  //check if user_id from request parameter is same as user_id from jwt token
  const jwtUser_id = req.decoded.id;
  const user_id = req.params.id;

  if (jwtUser_id != user_id) {
    return res.status(401).json({
      type: "failure",
      message: "UNAUTHORIZED... you can't edit some one else details",
    });
  }
  next();
};

module.exports = {
  verifyUser,
};
