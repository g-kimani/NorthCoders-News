exports.customErrors = (err, req, res, next) => {
  if (err.status && err.message) {
    res.status(err.status).send({ message: err.message });
  } else {
    // ? Send to other error handlers
    next(err);
  }
};

exports.psqlErrors = (err, req, res, next) => {
  const badRequestCodes = ["42703", "22P02", "42601", "23502"];
  if (badRequestCodes.includes(err.code)) {
    res.status(400).send({ message: "Bad Request: Invalid input" });
  } else if (err.code === "23503") {
    // 23503 - foreign_key_violation
    res.status(404).send({ message: "404 Not Found" });
  } else {
    next(err);
  }
};

exports.logError = (err, req, res, next) => {
  console.log(err);
  next();
};
