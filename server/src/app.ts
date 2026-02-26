import "dotenv/config";

import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "~/config/env";
import {
  errorHandler,
  notFoundHandler,
  requestIdMiddleware,
} from "~/middleware";
import { getCorsOrigin } from "~/utils/cors";

export async function createApp(): Promise<express.Application> {
  const app = express();

  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(cors({ origin: getCorsOrigin(), credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestIdMiddleware);
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

  app.use("/health", (_req, res) => res.json({ status: "ok" }));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
