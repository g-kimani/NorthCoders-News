const db = require("../db/connection.js");
const format = require("pg-format");

exports.selectArticleById = (article_id) => {
  if (isNaN(article_id)) {
    return Promise.reject({
      status: 400,
      message: "Bad Request: Article ID must be a number!",
    });
  }
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
    .then((result) => {
      // the ID does not exist
      if (result.rowCount === 0) {
        return Promise.reject({
          status: 404,
          message: `Not Found: Article ${article_id} does not exist`,
        });
      } else {
        return result.rows[0];
      }
    });
};

exports.createArticleComment = (article_id, comment) => {
  if (isNaN(article_id)) {
    return Promise.reject({
      status: 400,
      message: "Bad Request: Article ID must be a number!",
    });
  }

  const { username, body } = comment;

  if (typeof username !== "string" || typeof body !== "string") {
    return Promise.reject({
      status: 400,
      message: "Bad Request: username and body must be type string",
    });
  }

  const insertCommentQuery = format(
    `
    INSERT INTO comments
    (body, article_id, author)
    VALUES
    %L
    RETURNING *;
  `,
    [[body, article_id, username]]
  );

  return db.query(insertCommentQuery).then((result) => result.rows);
};
