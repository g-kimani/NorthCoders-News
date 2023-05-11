const { deleteComment } = require("../models/comments.model");

exports.removeComment = (req, res, next) => {
  const { comment_id } = req.params;
  deleteComment(comment_id)
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => next(err));
};
