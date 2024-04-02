const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("repotestAPI");
});

app.get("/api", (req, res) => {
  res.json({ message: "Welcome to the API" });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

const fs = require("fs");
let planets = JSON.parse(fs.readFileSync("planets.json", "utf8"));

app.get("/api/planets", (req, res) => {
  res.json(planets);
});
