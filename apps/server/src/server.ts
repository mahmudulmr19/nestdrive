import { createServer } from "node:http";
import type { Server } from "node:http";
import { createApp } from "~/app";
import { env } from "~/config/env";
import { logger } from "~/config/logger";

const GRACEFUL_SHUTDOWN_TIMEOUT_MS = 30_000;

let httpServer: Server | null = null;

async function run() {
  const app = await createApp();
  try {
    httpServer = createServer(app);

    httpServer.listen(env.PORT, () => {
      logger.info("Server listening", {
        port: env.PORT,
        nodeEnv: env.NODE_ENV,
      });
    });
  } catch (error) {
    logger.error("Server startup failed", { error });
    process.exit(1);
  }
}

function gracefulShutdown(signal: string) {
  logger.info("Received shutdown signal", { signal });
  if (!httpServer) {
    process.exit(0);
    return;
  }
  httpServer.close(() => {
    logger.info("HTTP server closed");
    process.exit(0);
  });
  const forceExit = setTimeout(() => {
    logger.warn("Graceful shutdown timeout, forcing exit");
    process.exit(1);
  }, GRACEFUL_SHUTDOWN_TIMEOUT_MS);
  forceExit.unref();
}

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", { error });
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  logger.error("Unhandled rejection", { error });
  process.exit(1);
});

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

void run();
