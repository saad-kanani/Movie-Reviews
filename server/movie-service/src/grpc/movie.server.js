const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const fs = require("fs");
const path = require("path");
const fakeMovies = require("../data/movies.json");
const { pool, waitForDatabase, ensureSchema } = require("../db");

// Load proto
const PROTO_PATH = [
  path.join(__dirname, "../../proto/movie.proto"),
  path.join(__dirname, "../../../proto/movie.proto"),
].find((candidate) => fs.existsSync(candidate));

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const movieProto = grpc.loadPackageDefinition(packageDefinition).movie;

const toMovieResponse = (row) => ({
  id: row.id,
  title: row.title,
  description: row.description,
  release_year: row.release_year,
  image: row.image || "",
  type: row.type || "",
  created_at: new Date(row.created_at).toISOString(),
});

const seedMoviesIfEmpty = async () => {
  const [countRows] = await pool.query("SELECT COUNT(*) AS total FROM movies");
  if (countRows[0].total > 0) {
    return;
  }

  for (const movie of fakeMovies) {
    await pool.query(
      "INSERT INTO movies (title, description, release_year, image, type) VALUES (?, ?, ?, ?, ?)",
      [
        movie.title,
        movie.description,
        movie.release_year,
        movie.image || "",
        movie.type || "",
      ],
    );
  }
};

// ===== gRPC Methods =====

// Create Movie
const createMovie = async (call, callback) => {
  const {
    title,
    description,
    release_year,
    image = "",
    type = "",
  } = call.request;

  if (!title || !description || !release_year) {
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: "All fields are required",
    });
  }

  try {
    const [result] = await pool.query(
      "INSERT INTO movies (title, description, release_year, image, type) VALUES (?, ?, ?, ?, ?)",
      [title, description, release_year, image, type],
    );

    const [rows] = await pool.query(
      "SELECT id, title, description, release_year, image, type, created_at FROM movies WHERE id = ?",
      [result.insertId],
    );

    callback(null, toMovieResponse(rows[0]));
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      message: "Failed to create movie",
    });
  }
};

// Get Movie by ID
const getMovie = async (call, callback) => {
  const { id } = call.request;

  try {
    const [rows] = await pool.query(
      "SELECT id, title, description, release_year, image, type, created_at FROM movies WHERE id = ?",
      [id],
    );

    if (rows.length === 0) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: "Movie not found",
      });
    }

    callback(null, toMovieResponse(rows[0]));
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      message: "Failed to fetch movie",
    });
  }
};

// List Movies
const listMovies = async (call, callback) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, title, description, release_year, image, type, created_at FROM movies ORDER BY id ASC",
    );
    callback(null, { movies: rows.map(toMovieResponse) });
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      message: "Failed to list movies",
    });
  }
};

// ===== Start Server =====

const startServer = async () => {
  await waitForDatabase();
  await ensureSchema();
  await seedMoviesIfEmpty();

  const server = new grpc.Server();

  server.addService(movieProto.MovieService.service, {
    CreateMovie: createMovie,
    GetMovie: getMovie,
    ListMovies: listMovies,
  });

  const PORT = process.env.PORT || 5002;

  server.bindAsync(
    `0.0.0.0:${PORT}`,
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
