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
import { authRoutes } from "./modules/auth/auth.routes";
import { openApiDocument } from "./config/openapi";
import { apiReference } from "@scalar/express-api-reference";

export async function createApp(): Promise<express.Application> {
  const app = express();

  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(cors({ origin: getCorsOrigin(), credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(requestIdMiddleware);
  app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

  app.use("/health", (_, res) => res.json({ status: "ok" }));
  app.use("/openapi.json", (_, res) => res.json(openApiDocument));
  app.use(
    "/docs",
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "script-src": [
            "'self'",
            "'unsafe-inline'",
            "https://cdn.jsdelivr.net",
          ],
          "style-src": [
            "'self'",
            "'unsafe-inline'",
            "https://cdn.jsdelivr.net",
          ],
          "connect-src": ["'self'", "https://cdn.jsdelivr.net"],
        },
      },
    }),
    apiReference({
      content: JSON.stringify(openApiDocument),
      theme: "alternate",
    }),
  );

  app.use("/v1/auth", authRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
