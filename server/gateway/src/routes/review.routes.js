const express = require("express");
const router = express.Router();
const reviewClient = require("../grpc/review.client");

// Add review
router.post("/", (req, res) => {
  reviewClient.AddReview(req.body, (err, response) => {
    if (err) return res.status(400).json(err);
    res.json(response);
  });
});

// Reviews by movie
router.get("/movie/:id", (req, res) => {
  reviewClient.GetReviewsByMovie(
    { movie_id: parseInt(req.params.id) },
    (err, response) => {
      if (err) return res.status(500).json(err);
      res.json(response.reviews);
    }
  );
});

module.exports = router;