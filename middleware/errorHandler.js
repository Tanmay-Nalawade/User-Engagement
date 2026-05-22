const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (err.code === 11000) {
    return res.status(409).json({
      error: "Duplicate value for a unique field",
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      error: "Validation failed",
      details: Object.values(err.errors).map((e) => e.message),
    });
  }

  if (err.statusCode) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  if (typeof err.status === "number" && err.status >= 400) {
    return res.status(err.status).json({
      error: err.message,
    });
  }

  console.error(err);
  res.status(500).json({ error: "Internal server error" });
};

module.exports = { errorHandler };
