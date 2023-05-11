const db = require("../db/connection.js");

exports.deleteComment = (comment_id) => {
  return db
    .query(
      `
        DELETE FROM comments
        WHERE comment_id = $1
    `,
      [comment_id]
    )
    .then((result) => {
      if (result.rowCount === 0) {
        return Promise.reject({ status: 404, message: "404: Not Found" });
      }
    });
};

exports.updateComment = (comment_id, { incVotes }) => {
  return db
    .query(
      `
    UPDATE comments
    SET
      votes = votes + $1
    WHERE
      comment_id = $2
    RETURNING *
  `,
      [incVotes, comment_id]
    )
    .then((result) => {
      if (result.rowCount === 0) {
        return Promise.reject({ status: 404, message: "404: Not Found" });
      }
      return result.rows[0];
    });
};
