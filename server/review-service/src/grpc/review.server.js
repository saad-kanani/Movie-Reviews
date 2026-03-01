const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

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

// ===== gRPC Clients to Other Services =====
const userClient = new userProto.UserService(
  "localhost:5001",
  grpc.credentials.createInsecure()
);

const movieClient = new movieProto.MovieService(
  "localhost:5002",
  grpc.credentials.createInsecure()
);

// ===== Fake Database =====
let reviews = [];
let currentId = 1;

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

      // 3️⃣ Create Review
      const newReview = {
        id: currentId++,
        user_id,
        movie_id,
        rating,
        comment,
        created_at: new Date().toISOString(),
      };

      reviews.push(newReview);

      callback(null, newReview);
    });
  });
};

// Get Reviews By Movie
const getReviewsByMovie = (call, callback) => {
  const { movie_id } = call.request;

  const movieReviews = reviews.filter(
    (review) => review.movie_id === movie_id
  );

  callback(null, { reviews: movieReviews });
};

// Get Reviews By User
const getReviewsByUser = (call, callback) => {
  const { user_id } = call.request;

  const userReviews = reviews.filter(
    (review) => review.user_id === user_id
  );

  callback(null, { reviews: userReviews });
};

// ===== Start Server =====
const startServer = () => {
  const server = new grpc.Server();

  server.addService(reviewProto.ReviewService.service, {
    AddReview: addReview,
    GetReviewsByMovie: getReviewsByMovie,
    GetReviewsByUser: getReviewsByUser,
  });

  const PORT = "0.0.0.0:5003";

  server.bindAsync(
    PORT,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error("Server binding error:", err);
        return;
      }

      console.log(`⭐ Review Service running on port ${port}`);
      server.start();
    }
  );
};

module.exports = startServer;