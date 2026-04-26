const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");
const { pool, waitForDatabase, ensureSchema } = require("../db");

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

const toUserResponse = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  created_at: new Date(row.created_at).toISOString(),
});

// ===== gRPC Methods =====

// Create User
const createUser = async (call, callback) => {
  const { name, email, password } = call.request;

  if (!name || !email || !password) {
    return callback({
      code: grpc.status.INVALID_ARGUMENT,
      message: "All fields are required",
    });
  }

  try {
    const [existingRows] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );

    if (existingRows.length > 0) {
      return callback({
        code: grpc.status.ALREADY_EXISTS,
        message: "Email already exists",
      });
    }

    const [result] = await pool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, password],
    );

    const [rows] = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE id = ?",
      [result.insertId],
    );

    callback(null, toUserResponse(rows[0]));
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      message: "Failed to create user",
    });
  }
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
const getUser = async (call, callback) => {
  const { id } = call.request;

  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE id = ?",
      [id],
    );

    if (rows.length === 0) {
      return callback({
        code: grpc.status.NOT_FOUND,
        message: "User not found",
      });
    }

    callback(null, toUserResponse(rows[0]));
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      message: "Failed to fetch user",
    });
  }
};

// List Users
const listUsers = async (call, callback) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, created_at FROM users ORDER BY id ASC",
    );
    callback(null, { users: rows.map(toUserResponse) });
  } catch (error) {
    callback({
      code: grpc.status.INTERNAL,
      message: "Failed to list users",
    });
  }
};

// ===== Server Setup =====

const startServer = async () => {
  await waitForDatabase();
  await ensureSchema();

  const server = new grpc.Server();


  server.addService(userProto.UserService.service, {
    CreateUser: createUser,
    LoginUser: loginUser,
    GetUser: getUser,
    ListUsers: listUsers,
  });

  const PORT = process.env.PORT || 5001;

  server.bindAsync(
    `0.0.0.0:${PORT}`,
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
