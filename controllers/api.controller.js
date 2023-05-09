const endpoints = require("../endpoints.json");

exports.getApiInfo = (req, res) => {
  res.status(200).send({ endpoints });
};
