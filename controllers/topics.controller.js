const { selectTopics, createTopic } = require("../models/topics.model");

exports.getTopics = (req, res, next) => {
  selectTopics().then((topics) => {
    res.status(200).send({ topics });
  });
};

exports.postTopic = (req, res, next) => {
  createTopic(req.body)
    .then((topic) => {
      res.status(201).send({ topic });
    })
    .catch((err) => next(err));
};
