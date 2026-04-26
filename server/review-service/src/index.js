const startServer = require("./grpc/review.server");

startServer().catch((error) => {
  console.error("Failed to start review service:", error);
  process.exit(1);
});
