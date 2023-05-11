const express = require("express");

const { getTopics } = require("./controllers/topics.controller.js");
const { getApiInfo } = require("./controllers/api.controller.js");
const {
  getArticleById,
  postArticleComment,
  getArticleComments,
  getArticles,
  patchArticleById,
} = require("./controllers/articles.controller.js");

const app = express();
app.use(express.json());

app.use(express.json());

app.get("/api", getApiInfo);

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);
app.patch("/api/articles/:article_id", patchArticleById);

app.get("/api/articles/:article_id/comments", getArticleComments);
app.post("/api/articles/:article_id/comments", postArticleComment);

app.use((err, req, res, next) => {
  if (err.status && err.message) {
    res.status(err.status).send({ message: err.message });
  } else {
    // ? Send to other error handlers
    next(err);
  }
});

app.use((err, req, res, next) => {
  //22P02	- invalid_text_representation
  if (err.code === "22P02" || err.code === "23502") {
    res.status(400).send({ message: "Bad Request: Invalid input" });
  } else if (err.code === "23503") {
    // 23503 - foreign_key_violation
    res.status(404).send({ message: "404 Not Found" });
  } else {
    next(err);
  }
});

module.exports = app;
