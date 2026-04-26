const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
const { pool, waitForDatabase, ensureSchema } = require("../db");

// ===== Load Review Proto =====
const REVIEW_PROTO_PATH = path.join(__dirname, "../../../proto/review.proto");
const USER_PROTO_PATH = path.join(__dirname, "../../../proto/user.proto");
const MOVIE_PROTO_PATH = path.join(__dirname, "../../../proto/movie.proto");

const reviewPackageDef = protoLoader.loadSync(REVIEW_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const userPackageDef = protoLoader.loadSync(USER_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const moviePackageDef = protoLoader.loadSync(MOVIE_PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const reviewProto = grpc.loadPackageDefinition(reviewPackageDef).review;
const userProto = grpc.loadPackageDefinition(userPackageDef).user;
const movieProto = grpc.loadPackageDefinition(moviePackageDef).movie;
const userServiceAddress = process.env.USER_SERVICE_ADDR || "localhost:5001";
const movieServiceAddress = process.env.MOVIE_SERVICE_ADDR || "localhost:5002";

// ===== gRPC Clients to Other Services =====
const userClient = new userProto.UserService(
  userServiceAddress,
  grpc.credentials.createInsecure(),
);

const movieClient = new movieProto.MovieService(
  movieServiceAddress,
  grpc.credentials.createInsecure(),
);

const toReviewResponse = (row) => ({
  id: row.id,
  user_id: row.user_id,
  movie_id: row.movie_id,
  rating: row.rating,
  comment: row.comment,
  created_at: new Date(row.created_at).toISOString(),
});

// ===== gRPC Methods =====

// Add Review
const addReview = (call, callback) => {
  const { user_id, movie_id, rating, comment } = call.request;

  if (!user_id || !movie_id || !rating || rating < 1 || rating > 5) {
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: "Invalid review data",
    });
  }

  // 1️⃣ Validate User
  userClient.GetUser({ id: user_id }, (userErr, userRes) => {
    if (userErr) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: "User not found",
      });
    }

    // 2️⃣ Validate Movie
    movieClient.GetMovie({ id: movie_id }, (movieErr, movieRes) => {
      if (movieErr) {
        return callback({
          code: grpc.status.NOT_FOUND,
          message: "Movie not found",
        });
      }

      pool
        .query(
          "INSERT INTO reviews (user_id, movie_id, rating, comment) VALUES (?, ?, ?, ?)",
          [user_id, movie_id, rating, comment],
        )
        .then(([result]) =>
          pool.query(
            "SELECT id, user_id, movie_id, rating, comment, created_at FROM reviews WHERE id = ?",
            [result.insertId],
          ),
        )
        .then(([rows]) => callback(null, toReviewResponse(rows[0])))
        .catch(() =>
          callback({
            code: grpc.status.INTERNAL,
            message: "Failed to create review",
          }),
        );
    });
  });
};

// Get Reviews By Movie
const getReviewsByMovie = async (call, callback) => {
  const { movie_id } = call.request;

  try {
    const [rows] = await pool.query(
      "SELECT id, user_id, movie_id, rating, comment, created_at FROM reviews WHERE movie_id = ? ORDER BY id DESC",
      [movie_id],
    );
    callback(null, { reviews: rows.map(toReviewResponse) });
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      message: "Failed to fetch reviews",
    });
  }
};

// Get Reviews By User
const getReviewsByUser = async (call, callback) => {
  const { user_id } = call.request;

  try {
    const [rows] = await pool.query(
      "SELECT id, user_id, movie_id, rating, comment, created_at FROM reviews WHERE user_id = ? ORDER BY id DESC",
      [user_id],
    );
    callback(null, { reviews: rows.map(toReviewResponse) });
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      message: "Failed to fetch reviews",
    });
  }
};

// ===== Start Server =====
const startServer = async () => {
  await waitForDatabase();
  await ensureSchema();

  const server = new grpc.Server();

  server.addService(reviewProto.ReviewService.service, {
    AddReview: addReview,
    GetReviewsByMovie: getReviewsByMovie,
    GetReviewsByUser: getReviewsByUser,
  });

  const PORT = process.env.PORT || 5003;

  server.bindAsync(
    `0.0.0.0:${PORT}`,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error("Server binding error:", err);
        return;
      }

      console.log(`⭐ Review Service running on port ${port}`);
      server.start();
    },
  );
};

module.exports = startServer;
