const express = require("express");
const cors = require("cors");

const userRoutes = require("./routes/user.routes");
const movieRoutes = require("./routes/movie.routes");
const reviewRoutes = require("./routes/review.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/reviews", reviewRoutes);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`🌐 API Gateway running on http://localhost:${PORT}`);
});
