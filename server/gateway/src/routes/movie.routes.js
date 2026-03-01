const express = require("express");
const router = express.Router();
const movieClient = require("../grpc/movie.client");

// Create movie
router.post("/", (req, res) => {
  movieClient.CreateMovie(req.body, (err, response) => {
    if (err) return res.status(400).json(err);
    res.json(response);
  });
});

// List movies
router.get("/", (req, res) => {
  movieClient.ListMovies({}, (err, response) => {
    if (err) return res.status(500).json(err);
    res.json(response.movies);
  });
});

// Get movie
router.get("/:id", (req, res) => {
  movieClient.GetMovie({ id: parseInt(req.params.id) }, (err, response) => {
    if (err) return res.status(404).json(err);
    res.json(response);
  });
});

module.exports = router;