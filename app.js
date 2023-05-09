const express = require("express");

const { getArticleById } = require("./controllers/articles.controller.js");
const { getTopics } = require("./controllers/topics.controller.js");
const { getApiInfo } = require("./controllers/api.controller.js");
const { getArticleById } = require("./controllers/articles.controller.js");

const app = express();

app.get("/api", getApiInfo);

app.get("/api/topics", getTopics);

app.get("/api/articles/:article_id", getArticleById);

app.use((err, req, res, next) => {
  if (err.status && err.message) {
    res.status(err.status).send({ message: err.message });
  } else {
    // ? Send to other error handlers
    next(err);
  }
});

module.exports = app;
