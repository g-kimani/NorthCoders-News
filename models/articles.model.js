const format = require("pg-format");
const db = require("../db/connection.js");

exports.selectArticles = ({
  topic,
  sort_by = "created_at",
  order = "desc",
}) => {
  let selectQuery = format(
    `
      SELECT articles.article_id, articles.author, articles.title, articles.topic, articles.created_at, articles.votes, articles.article_img_url, COUNT(comment_id) AS comment_count
      FROM articles
      LEFT OUTER JOIN comments ON comments.article_id = articles.article_id
      `
  );

  if (topic) {
    selectQuery += format(`WHERE articles.topic = '%s'`, topic);
  }

  selectQuery += format(
    `
    GROUP BY articles.article_id
    ORDER BY articles.%I %s;`,
    sort_by,
    order
  );

  return db.query(selectQuery).then((result) => result.rows);
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
