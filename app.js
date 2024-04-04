var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var fs = require("fs");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

let data = JSON.parse(fs.readFileSync("planets.json", "utf8"));
let planets = data.planets;

// Routes
app.get("/", (req, res) => {
  res.send("repotestAPI");
});

// Welcome message
app.get("/api", (req, res) => {
  res.json({ message: "Welcome to the API" });
});

// Get all planets
app.get("/api/planets", (req, res) => {
  res.json(planets);
});

// Get planet by name
app.get("/api/planets/:name", (req, res) => {
  const planet = planets.find((p) => p.name === req.params.name);
  if (!planet) {
    return res.status(404).json({ message: "Planet not found" });
  }
  res.json(planet);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

const port = 3000;
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

module.exports = app;
