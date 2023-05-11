const format = require("pg-format");
const db = require("../db/connection.js");
const { selectTopicBySlug } = require("./topics.model.js");

exports.selectArticles = async ({
  topic,
  sort_by = "created_at",
  order = "desc",
  limit = 10,
  p = 1,
}) => {
  let selectQuery = format(
    `
      SELECT articles.article_id, articles.author, articles.title, articles.topic, articles.created_at, articles.votes, articles.article_img_url, CAST(COUNT(comment_id) AS INT) AS comment_count, (SELECT CAST(COUNT(*) AS INT) FROM articles ${
        topic ? "WHERE topic = '%s'" : ""
      }) AS total_count
      FROM articles
      LEFT OUTER JOIN comments ON comments.article_id = articles.article_id
      `,
    [topic]
  );

  if (topic) {
    const topicObject = await selectTopicBySlug(topic);
    if (topicObject) {
      selectQuery += format(`WHERE articles.topic = '%s'`, topic);
    } else {
      return Promise.reject({
        status: 404,
        message: "404 Topic not found",
      });
    }
  }

  selectQuery += format(
    `
    GROUP BY articles.article_id
    ORDER BY articles.%I %s
    LIMIT %s OFFSET %s`,
    sort_by,
    order,
    limit,
    (Number(p) - 1) * limit
  );

  return db.query(selectQuery).then(({ rows }) => {
    return {
      total_count: rows[0]?.total_count ?? 0,
      articles: rows.map((row) => {
        delete row.total_count;
        return row;
      }),
    };
  });
};

exports.getArticlesCount = () => {
  return db
    .query("SELECT CAST(COUNT(*) AS INT) AS total_count FROM articles")
    .then((result) => result.rows[0].total_count);
};

exports.selectArticleById = (article_id) => {
  return db
    .query(
      `
    SELECT articles.*, CAST(COUNT(comment_id) AS INT) AS comment_count
    FROM articles 
    LEFT JOIN comments ON comments.article_id = articles.article_id
    WHERE articles.article_id = $1
    GROUP BY articles.article_id;
    `,
      [article_id]
    )
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

exports.createArticle = ({
  author,
  title,
  body,
  topic,
  article_img_url = "[default image here]",
}) => {
  const insertArticleQuery = format(
    `INSERT INTO articles
    (author, title, body, topic, article_img_url)
    VALUES
    %L
    RETURNING *;
    `,
    [[author, title, body, topic, article_img_url]]
  );

  return db.query(insertArticleQuery).then((result) => {
    const article = result.rows[0];
    return this.selectArticleById(article.article_id);
  });
};

exports.createArticleComment = (article_id, comment) => {
  const { username, body } = comment;

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
};

exports.selectArticleComments = (article_id) => {
  return this.articleExists(article_id)
    .then((article) => {
      if (!article) {
        return Promise.reject({
          status: 404,
          message: `Not Found: Article ${article_id} does not exist`,
        });
      } else {
        return db.query(
          `SELECT * FROM comments 
        WHERE article_id = $1
        ORDER BY created_at DESC;
    `,
          [article_id]
        );
      }
    })
    .then((result) => result.rows);
};

exports.articleExists = (article_id) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
    .then((result) => result.rows[0]);
};

exports.updateArticle = (article_id, updateProperties) => {
  const { incVotes } = updateProperties;
  return db
    .query(
      `
    UPDATE articles
    SET
      votes = votes + $1
    WHERE
      article_id = $2
    RETURNING *;
    `,
      [incVotes, article_id]
    )
    .then((result) => {
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
