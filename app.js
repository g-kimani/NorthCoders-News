const express = require("express");
const cors = require("cors");

const apiRouter = require("./routes/api-router.js");
const { customErrors, psqlErrors, logError } = require("./error-handlers.js");

const app = express();

app.use(cors());
app.use(express.json());

// TODO - redirects to frontend (messed up cv link)
app.get("/", (req, res) => {
  const frontendLink = "https://visionary-kashata-762e78.netlify.app/";
  res.redirect(frontendLink);
});

app.use("/api", apiRouter);

app.use((err, req, res, next) => {
  console.log(err);
  next(err);
});
app.use(customErrors);
app.use(psqlErrors);
app.use(logError);

module.exports = app;
