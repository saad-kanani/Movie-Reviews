const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const PROTO_PATH = path.join(__dirname, "../../../proto/user.proto");

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
});

const userProto = grpc.loadPackageDefinition(packageDef).user;

const userClient = new userProto.UserService(
  "localhost:5001",
  grpc.credentials.createInsecure()
);

module.exports = userClient;