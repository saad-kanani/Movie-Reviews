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
const reviewServiceAddress =
  process.env.REVIEW_SERVICE_ADDR || "localhost:5003";

const reviewClient = new reviewProto.ReviewService(
  reviewServiceAddress,
  grpc.credentials.createInsecure(),
);

module.exports = reviewClient;
