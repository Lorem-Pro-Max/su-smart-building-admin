export const handleError = (res, error, reqInfo) => {
  const statusCode = error.status || 500;

  console.error(
    `[API ERROR] ${statusCode} - ${reqInfo}:`,
    error.message || error,
  );

  return res.status(statusCode).json({
    success: false,
    error:
      statusCode === 500
        ? "An internal server error occurred. Please try again later."
        : error.message,
  });
};
