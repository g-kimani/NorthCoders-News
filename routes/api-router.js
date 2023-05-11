const { getApiInfo } = require("../controllers/api.controller");
const articleRouter = require("./article-router");
const commentRouter = require("./comment-router");
const topicsRouter = require("./topic-router");
const userRouter = require("./user-router");

const apiRouter = require("express").Router();

apiRouter.get("/", getApiInfo);

apiRouter.use("/users", userRouter);
apiRouter.use("/topics", topicsRouter);
apiRouter.use("/articles", articleRouter);
apiRouter.use("/comments", commentRouter);

module.exports = apiRouter;
