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
const { getUsers } = require("./controllers/users.controller.js");
const { removeComment } = require("./controllers/comments.controller.js");

const app = express();
app.use(express.json());

app.use(express.json());

app.get("/api", getApiInfo);

app.get("/api/users", getUsers);
app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);
app.patch("/api/articles/:article_id", patchArticleById);

app.get("/api/articles/:article_id/comments", getArticleComments);
app.post("/api/articles/:article_id/comments", postArticleComment);

app.delete("/api/comments/:comment_id", removeComment);

app.use((err, req, res, next) => {
  if (err.status && err.message) {
    res.status(err.status).send({ message: err.message });
  } else {
    // ? Send to other error handlers
    next(err);
  }
});

app.use((err, req, res, next) => {
  const badRequestCodes = ["42703", "22P02", "42601", "23502"];
  if (badRequestCodes.includes(err.code)) {
    res.status(400).send({ message: "Bad Request: Invalid input" });
  } else if (err.code === "23503") {
    // 23503 - foreign_key_violation
    res.status(404).send({ message: "404 Not Found" });
  } else {
    next(err);
  }
});

app.use((err, req, res, next) => {
  console.log(err);
});
module.exports = app;
