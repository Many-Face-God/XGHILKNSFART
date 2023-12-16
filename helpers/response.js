/*
This function is responsible for sending response back to the client
*/

module.exports = (res, statusCode, message, data) => {
  res.status(statusCode).json({
    message,
    data: data ? data : [],
  });
};
