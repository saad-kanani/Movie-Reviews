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

const movieClient = new movieProto.MovieService(
  "localhost:5002",
  grpc.credentials.createInsecure()
);

module.exports = movieClient;