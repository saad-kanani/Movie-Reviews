const startServer = require("./grpc/movie.server");

startServer().catch((error) => {
  console.error("Failed to start movie service:", error);
  process.exit(1);
});
