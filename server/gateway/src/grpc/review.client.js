const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const PROTO_PATH = path.join(__dirname, "../../../proto/review.proto");

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
});

const reviewProto = grpc.loadPackageDefinition(packageDef).review;

const reviewClient = new reviewProto.ReviewService(
  "localhost:5003",
  grpc.credentials.createInsecure()
);

module.exports = reviewClient;