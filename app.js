const express = require("express");
const { getTopics } = require("./controllers/topics.controller.js");
const { getApiInfo } = require("./controllers/api.controller.js");

const app = express();

app.get("/api", getApiInfo);

app.get("/api/topics", getTopics);

module.exports = app;
