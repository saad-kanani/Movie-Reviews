const express = require("express");
const router = express.Router();
const userClient = require("../grpc/user.client");

// Create user
router.post("/", (req, res) => {
  userClient.CreateUser(req.body, (err, response) => {
    if (err) return res.status(400).json(err);
    res.json(response);
  });
});

// Login user
router.post("/login", (req, res) => {
  userClient.LoginUser(req.body, (err, response) => {
    if (err) return res.status(400).json(err);
    res.json(response);
  });
});

// Get user
router.get("/:id", (req, res) => {
  userClient.GetUser({ id: parseInt(req.params.id) }, (err, response) => {
    if (err) return res.status(404).json(err);
    res.json(response);
  });
});

module.exports = router;
