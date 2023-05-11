const { removeComment } = require("../controllers/comments.controller");

const commentRouter = require("express").Router();

commentRouter.delete("/:comment_id", removeComment);

module.exports = commentRouter;
