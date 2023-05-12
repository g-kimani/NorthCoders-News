const db = require("../db/connection.js");

exports.selectTopics = () => {
  return db.query("SELECT * FROM topics;").then((result) => result.rows);
};

exports.selectTopicBySlug = (topic_slug) => {
  return db
    .query("SELECT * FROM topics WHERE slug = $1", [topic_slug])
    .then((result) => result.rows[0]);
};

exports.createTopic = ({ slug, description }) => {
  return db
    .query(
      `
      INSERT INTO topics
      (slug, description)
      VALUES
      ($1, $2)
      RETURNING *`,
      [slug, description]
    )
    .then((result) => result.rows[0]);
};
