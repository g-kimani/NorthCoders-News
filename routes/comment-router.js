const {
  removeComment,
  patchComment,
} = require("../controllers/comments.controller");

const commentRouter = require("express").Router();

commentRouter.delete("/:comment_id", removeComment);
commentRouter.patch("/:comment_id", patchComment);

module.exports = commentRouter;
