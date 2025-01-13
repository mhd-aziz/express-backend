const sendErrorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({ error: message });
};

module.exports = {
  sendErrorResponse,
};
