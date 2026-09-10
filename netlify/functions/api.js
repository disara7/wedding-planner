const express = require("express");
const serverless = require("serverless-http");

const app = express();

app.use(express.json());

app.get("/api/hello", (req, res) => {
  res.json({ message: "Wedding planner API is working!" });
});

// Put your existing routes here

module.exports.handler = serverless(app);