const express = require("express");

const { getTopics } = require("./controllers/topics.controller.js");
const { getApiInfo } = require("./controllers/api.controller.js");
const {
  getArticleById,
  getArticleComments,
  getArticles,
} = require("./controllers/articles.controller.js");

const app = express();

app.get("/api", getApiInfo);

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles/:article_id/comments", getArticleComments);

app.use((err, req, res, next) => {
  if (err.status && err.message) {
    res.status(err.status).send({ message: err.message });
  } else {
    // ? Send to other error handlers
    next(err);
  }
});

app.use((err, req, res, next) => {
  const badRequestCodes = ["42703", "22P02", "42601"];
  if (badRequestCodes.includes(err.code)) {
    res.status(400).send({ message: "Bad Request: Invalid input" });
  }
});

app.use((err, req, res, next) => {
  console.log(err);
});
module.exports = app;
