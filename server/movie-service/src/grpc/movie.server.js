const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
const fakeMovies = require("../data/movies.json");

// Load proto
const PROTO_PATH = path.join(__dirname, "../../../proto/movie.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const movieProto = grpc.loadPackageDefinition(packageDefinition).movie;

// ===== Fake Database (Replace later with real DB) =====
let movies = [];
let currentId = 1;

fakeMovies.forEach((movie) => {
  movies.push({
    id: movie.id,
    title: movie.title,
    description: movie.description,
    release_year: movie.release_year,
    type: movie.type,
    image: movie.image,
    created_at: new Date().toISOString(),
  });
});

// ===== gRPC Methods =====

// Create Movie
const createMovie = (call, callback) => {
  const { title, description, release_year } = call.request;

  if (!title || !description || !release_year) {
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: "All fields are required",
    });
  }

  const newMovie = {
    id: currentId++,
    title,
    description,
    release_year,
    image,
    type,
    created_at: new Date().toISOString(),
  };

  movies.push(newMovie);

  callback(null, newMovie);
};

// Get Movie by ID
const getMovie = (call, callback) => {
  const { id } = call.request;

  const movie = movies.find((m) => m.id === id);

  if (!movie) {
    return callback({
      code: grpc.status.NOT_FOUND,
      message: "Movie not found",
    });
  }

  callback(null, movie);
};

// List Movies
const listMovies = (call, callback) => {
  callback(null, { movies });
};

// ===== Start Server =====

const startServer = () => {
  const server = new grpc.Server();

  server.addService(movieProto.MovieService.service, {
    CreateMovie: createMovie,
    GetMovie: getMovie,
    ListMovies: listMovies,
  });

  const PORT = "0.0.0.0:5002";

  server.bindAsync(
    PORT,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error("Server binding error:", err);
        return;
      }

      console.log(`🎬 Movie Service running on port ${port}`);
      server.start();
    },
  );
};

module.exports = startServer;
