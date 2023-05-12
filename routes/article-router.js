const {
  getArticles,
  postArticle,
  getArticleById,
  patchArticleById,
  deleteArticleById,
  getArticleComments,
  postArticleComment,
} = require("../controllers/articles.controller");

const articleRouter = require("express").Router();

articleRouter.route("/").get(getArticles).post(postArticle);

articleRouter
  .route("/:article_id")
  .get(getArticleById)
  .patch(patchArticleById)
  .delete(deleteArticleById);

articleRouter
  .route("/:article_id/comments")
  .get(getArticleComments)
  .post(postArticleComment);

module.exports = articleRouter;
