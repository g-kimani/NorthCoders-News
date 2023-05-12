const {
  selectArticleById,
  createArticle,
  createArticleComment,
  selectArticleComments,
  selectArticles,
  updateArticle,
} = require("../models/articles.model");

exports.getArticles = (req, res, next) => {
  selectArticles(req.query)
    .then(({ articles, total_count }) => {
      res.status(200).send({ articles, total_count });
    })
    .catch((err) => next(err));
};
exports.getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => next(err));
};

exports.postArticle = (req, res, next) => {
  createArticle(req.body)
    .then((article) => {
      res.status(201).send({ article });
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

exports.getArticleComments = (req, res, next) => {
  const { article_id } = req.params;
  selectArticleComments(article_id, req.query)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch((err) => next(err));
};

exports.patchArticleById = (req, res, next) => {
  const { article_id } = req.params;
  updateArticle(article_id, req.body)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => next(err));
};
