// utils/responseUtils.js

const successResponse = (res, message, data = {}, status = 200) => {
  return res.status(status).json({
    status: "success",
    message,
    data,
  });
};

const errorResponse = (res, message, status = 400, errors = null) => {
  return res.status(status).json({
    status: "error",
    message,
    errors,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
