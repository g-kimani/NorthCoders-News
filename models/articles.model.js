const db = require("../db/connection.js");
const format = require("pg-format");

exports.selectArticles = () => {
  return db
    .query(
      `SELECT articles.article_id, articles.author, articles.title, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comment_id) AS comment_count
      FROM articles
      JOIN comments ON comments.article_id = articles.article_id
      GROUP BY articles.article_id
      ORDER BY articles.created_at DESC;`
    )
    .then((result) => result.rows);
};

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

  return checkUserExists(username).then((user) => {
    if (!user) {
      return Promise.reject({
        status: 400,
        message: "Bad Request: User does not exist",
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

    return db.query(insertCommentQuery).then((result) => result.rows[0]);
  });
};

const checkUserExists = (username) => {
  return db
    .query(`SELECT * FROM users WHERE username = $1`, [username])
    .then((result) => result.rows[0]);
};
