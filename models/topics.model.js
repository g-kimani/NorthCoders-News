const db = require("../db/connection.js");

exports.selectTopics = () => {
  return db.query("SELECT * FROM topics;").then((result) => result.rows);
};

exports.selectTopicBySlug = (topic_slug) => {
  return db
    .query("SELECT * FROM topics WHERE slug = $1", [topic_slug])
    .then((result) => result.rows[0]);
};
