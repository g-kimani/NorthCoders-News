const db = require("../db/connection.js");

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

exports.selectArticleComments = (article_id) => {
  return db
    .query(
      `
    SELECT * FROM comments 
    WHERE article_id = $1
    ORDER BY created_at DESC;
    `,
      [article_id]
    )
    .then((result) => {
      if (result.rowCount === 0) {
        return Promise.reject({
          status: 404,
          message: `Not Found: Article ${article_id} does not exist`,
        });
      } else {
        return result.rows;
      }
    });
};
