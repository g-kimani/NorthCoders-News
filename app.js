const express = require("express");
const cors = require("cors");

const apiRouter = require("./routes/api-router.js");
const { customErrors, psqlErrors, logError } = require("./error-handlers.js");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", apiRouter);

app.use((err, req, res, next) => {
  console.log(err);
  next(err);
});
app.use(customErrors);
app.use(psqlErrors);
app.use(logError);

module.exports = app;
