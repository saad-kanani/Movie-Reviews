const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

// Load proto file
const PROTO_PATH = path.join(__dirname, "../../../proto/user.proto");

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const userProto = grpc.loadPackageDefinition(packageDefinition).user;

// ===== Fake Database (Replace with real DB later) =====
let users = [];
let currentId = 1;

// ===== gRPC Methods =====

// Create User
const createUser = (call, callback) => {
  const { name, email, password } = call.request;

  if (!name || !email || !password) {
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: "All fields are required",
    });
  }

  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    return callback({
      code: grpc.status.ALREADY_EXISTS,
      message: "Email already exists",
    });
  }

  const newUser = {
    id: currentId++,
    name,
    email,
    password, // ⚠️ In production: hash it
    created_at: new Date().toISOString(),
  };

  users.push(newUser);

  callback(null, {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    created_at: newUser.created_at,
  });
};

// Login User
const loginUser = (call, callback) => {
  const { email, password } = call.request;
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return callback({
      code: grpc.status.UNAUTHENTICATED,
      message: "Invalid email or password",
    });
  }

  callback(null, {
    id: user.id,
    name: user.name,
    email: user.email,
    created_at: user.created_at,
  });
};

// Get User by ID
const getUser = (call, callback) => {
  const { id } = call.request;

  const user = users.find((u) => u.id === id);

  if (!user) {
    return callback({
      code: grpc.status.NOT_FOUND,
      message: "User not found",
    });
  }

  callback(null, {
    id: user.id,
    name: user.name,
    email: user.email,
    created_at: user.created_at,
  });
};

// List Users
const listUsers = (call, callback) => {
  const formattedUsers = users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    created_at: user.created_at,
  }));

  callback(null, { users: formattedUsers });
};

// ===== Server Setup =====

const startServer = () => {
  const server = new grpc.Server();


  server.addService(userProto.UserService.service, {
    CreateUser: createUser,
    LoginUser: loginUser,
    GetUser: getUser,
    ListUsers: listUsers,
  });

  const PORT = "0.0.0.0:5001";

  server.bindAsync(
    PORT,
    grpc.ServerCredentials.createInsecure(),
    (err, port) => {
      if (err) {
        console.error("Server binding error:", err);
        return;
      }
      console.log(`🚀 User Service running on port ${port}`);
      server.start();
    },
  );
};

module.exports = startServer;
