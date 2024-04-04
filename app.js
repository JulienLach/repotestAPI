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

// Il faut mettre le middleware avant les routes qui en ont besoin et après les routes get pour ne pas bloquer les requêtes
///// MIDDLEWARE pour vérifier que toutes les planètes ont un nom, un diamètre et une distance du soleil
// Le middleware s'exécute pour toutes les routes qui ont le préfixe /api/planets et donc retourne erreur si les champs ne sont pas remplis
app.use((req, res, next) => {
  const planet = req.body;
  if (!planet.name || !planet.diameter || !planet.distanceFromSun) {
    res
      .status(400)
      .json({ message: "Erreur, il manque un paramètre dans le body" });
  } else {
    next();
  }
});

// Poster une nouvelle planète
app.post("/api/planets", (req, res) => {
  const planet = req.body;
  if (!planet.name || !planet.diameter || !planet.distanceFromSun) {
    return res.status(400).json({ message: "Erreur" });
  }
  planets.push(planet);
  fs.writeFileSync(
    // Écrire dans le fichier planets.json
    "planets.json",
    JSON.stringify({ planets: planets }, null, 2) // Formater le JSON pour qu'il soit plus lisible (2 espaces)
  );
  res.json(planet); // Renvoyer la planète créée avec son id attribué par le serveur
});

// Mettre à jour une planète
app.put("/api/planets/:name", (req, res) => {
  const planet = req.body;
  const index = planets.findIndex((p) => p.name === req.params.name); // Trouver l'index de la planète à mettre à jour
  if (index === -1) {
    return res.status(404).json({ message: "Planet not found" });
  }
  planets[index] = planet; // Remplacer la planète par la nouvelle
  fs.writeFileSync(
    "planets.json",
    JSON.stringify({ planets: planets }, null, 2)
  );
  res.json(planet);
});

// Supprimer une planète
app.delete("/api/planets/:name", (req, res) => {
  // prendre le nom en entrée de la requete
  const name = req.params.name;
  // trouver l'index de la planète à supprimer
  const index = planets.findIndex((p) => p.name === name);
  // si l'index est -1, la planète n'existe pas
  if (index === -1) {
    return res.status(404).json({ message: "Planet not found" });
  }
  // supprimer la planète
  planets.splice(index, 1);
  // écrire le fichier planets.json
  fs.writeFileSync(
    "planets.json",
    JSON.stringify({ planets: planets }, null, 2)
  );
  res.json({ message: "Planet deleted" });
});

////////////////////// Gestion serveur //////////////////////
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
