import { createServer } from "node:http";
import { createApp } from "~/app";
import { env } from "~/config/env";
import { logger } from "~/config/logger";

async function run() {
  const app = await createApp();
  try {
    const server = createServer(app);

    server.listen(env.PORT, () => {
      console.log(`🚀 Server is running on port http://localhost:${env.PORT}`);
    });
  } catch (error) {
    logger.error("Server startup failed", { error });
    process.exit(1);
  }
}

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", { error });
  process.exit(1);
});

process.on("unhandledRejection", (error) => {
  logger.error("Unhandled rejection", { error });
  process.exit(1);
});

void run();
