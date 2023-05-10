const {
  selectArticleById,
  createArticleComment,
} = require("../models/articles.model");

exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => next(err));
};

exports.postArticleComment = (req, res, next) => {
  const { article_id } = req.params;
  createArticleComment(article_id, req.body)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => next(err));
};
