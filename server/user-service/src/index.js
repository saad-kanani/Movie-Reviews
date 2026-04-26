const startServer = require("./grpc/user.server");

startServer().catch((error) => {
  console.error("Failed to start user service:", error);
  process.exit(1);
});
