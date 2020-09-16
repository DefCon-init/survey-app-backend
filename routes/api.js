var express = require("express");
var authRouter = require("./auth");
var surveyRouter = require("./survey");
var resultRouter = require("./result");

var app = express();

app.use("/auth/", authRouter);
app.use("/survey/", surveyRouter);
app.use("/result/", resultRouter);

module.exports = app;