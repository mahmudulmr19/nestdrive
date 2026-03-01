import { createDocument } from "zod-openapi";
import { env } from "./env";
import {
  AuthTokenSchema,
  CreateUserSchema,
  LoginUserSchema,
  UserSchema,
} from "@nestdrive/schemas/user";
import { jsonResponse, requestBody } from "~/utils/openapi";
import { openApiErrorResponsesComponents } from "~/utils/openapi/responses";

export const openApiDocument: ReturnType<typeof createDocument> =
  createDocument({
    openapi: "3.1.1",
    info: {
      title: "NestDrive API",
      version: "0.0.1",
    },

    servers: [
      {
        url: env.SERVER_URL,
        description: "Development server",
      },
    ],
    tags: [
      {
        name: "Auth",
        description:
          "Endpoints related to user authentication and registration",
      },
    ],
    paths: {
      "/v1/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user",
          requestBody: requestBody(CreateUserSchema, "User registration data"),
          responses: {
            201: jsonResponse(AuthTokenSchema, "User registered successfully"),
          },
        },
      },
      "/v1/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login a user",
          requestBody: requestBody(LoginUserSchema, "User login data"),
          responses: {
            200: jsonResponse(AuthTokenSchema, "User logged in successfully"),
          },
        },
      },
    },
    components: {
      schemas: {
        UserSchema,
      },
      securitySchemes: {
        token: {
          type: "http",
          scheme: "bearer",
          description: "Bearer token for authentication",
        },
      },
      responses: {
        ...openApiErrorResponsesComponents,
      },
    },
  });
