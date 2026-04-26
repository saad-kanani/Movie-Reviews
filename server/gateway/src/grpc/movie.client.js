const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const PROTO_PATH = path.join(__dirname, "../../../proto/movie.proto");

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
});

const movieProto = grpc.loadPackageDefinition(packageDef).movie;
const movieServiceAddress = process.env.MOVIE_SERVICE_ADDR || "localhost:5002";

const movieClient = new movieProto.MovieService(
  movieServiceAddress,
  grpc.credentials.createInsecure(),
);

module.exports = movieClient;
