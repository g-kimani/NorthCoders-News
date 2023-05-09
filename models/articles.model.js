const db = require("../db/connection.js");

exports.selectArticles = () => {
  return db
    .query(
      `SELECT articles.*, COUNT(comment_id) AS comment_count
      FROM articles
      JOIN comments ON comments.article_id = articles.article_id
      GROUP BY articles.article_id
      ORDER BY articles.created_at DESC;`
    )
    .then((result) =>
      result.rows.map((article) => {
        // remove the article body
        delete article.body;
        return article;
      })
    );
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
