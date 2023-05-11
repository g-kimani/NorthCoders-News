const { getUsers } = require("../controllers/users.controller");

const userRouter = require("express").Router();

userRouter.get("/", getUsers);

module.exports = userRouter;
