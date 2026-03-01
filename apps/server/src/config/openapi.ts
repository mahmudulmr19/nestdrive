import { createDocument } from "zod-openapi";
import { env } from "./env";
import {
  AuthTokenSchema,
  CreateUserSchema,
  ForgotPasswordSchema,
  LoginUserSchema,
  ResetPasswordSchema,
  UserSchema,
} from "@nestdrive/schemas/user";
import {
  CreateSubscriptionPackageSchema,
  SubscriptionPackageSchema,
  UpdateSubscriptionPackageSchema,
} from "@nestdrive/schemas/subscription-package";
import { AdminStatsSchema } from "@nestdrive/schemas/admin-stats";
import { jsonResponse, requestBody } from "~/utils/openapi";
import {
  openApiErrorResponses,
  openApiErrorResponsesComponents,
} from "~/utils/openapi/responses";
import * as z from "zod/v4";

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
      {
        name: "Users",
        description: "Endpoints related to user management",
      },
      {
        name: "Admin",
        description: "Admin-only endpoints for managing subscription packages",
      },
    ],
    paths: {
      "/v1/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user",
          requestBody: requestBody(CreateUserSchema, "User registration data"),
          responses: {
            ...openApiErrorResponses,
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
            ...openApiErrorResponses,
            200: jsonResponse(AuthTokenSchema, "User logged in successfully"),
          },
        },
      },
      "/v1/auth/forgot-password": {
        post: {
          tags: ["Auth"],
          summary: "Send a password reset email",
          requestBody: requestBody(ForgotPasswordSchema, "Email address"),
          responses: {
            ...openApiErrorResponses,
            200: { description: "Reset link sent if email exists" },
          },
        },
      },
      "/v1/auth/reset-password": {
        post: {
          tags: ["Auth"],
          summary: "Reset password using a token",
          requestBody: requestBody(
            ResetPasswordSchema,
            "Token and new password",
          ),
          responses: {
            ...openApiErrorResponses,
            200: { description: "Password reset successfully" },
          },
        },
      },
      "/v1/users/me": {
        get: {
          tags: ["Users"],
          summary: "Get current user",
          security: [{ token: [] }],
          responses: {
            ...openApiErrorResponses,
            200: jsonResponse(UserSchema, "Current user data"),
          },
        },
      },
      "/v1/admin/stats": {
        get: {
          tags: ["Admin"],
          summary: "Get admin dashboard stats",
          security: [{ token: [] }],
          responses: {
            ...openApiErrorResponses,
            200: jsonResponse(AdminStatsSchema, "Admin dashboard statistics"),
          },
        },
      },
      "/v1/admin/packages": {
        get: {
          tags: ["Admin"],
          summary: "List all subscription packages",
          security: [{ token: [] }],
          responses: {
            ...openApiErrorResponses,
            200: jsonResponse(
              z.array(SubscriptionPackageSchema),
              "List of subscription packages",
            ),
          },
        },
        post: {
          tags: ["Admin"],
          summary: "Create a subscription package",
          security: [{ token: [] }],
          requestBody: requestBody(
            CreateSubscriptionPackageSchema,
            "Subscription package data",
          ),
          responses: {
            ...openApiErrorResponses,
            201: jsonResponse(
              SubscriptionPackageSchema,
              "Subscription package created",
            ),
          },
        },
      },
      "/v1/admin/packages/{id}": {
        get: {
          tags: ["Admin"],
          summary: "Get a subscription package",
          security: [{ token: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            ...openApiErrorResponses,
            200: jsonResponse(
              SubscriptionPackageSchema,
              "Subscription package data",
            ),
          },
        },
        put: {
          tags: ["Admin"],
          summary: "Update a subscription package",
          security: [{ token: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: requestBody(
            UpdateSubscriptionPackageSchema,
            "Subscription package update data",
          ),
          responses: {
            ...openApiErrorResponses,
            200: jsonResponse(
              SubscriptionPackageSchema,
              "Subscription package updated",
            ),
          },
        },
        delete: {
          tags: ["Admin"],
          summary: "Delete a subscription package",
          security: [{ token: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            ...openApiErrorResponses,
            204: { description: "Subscription package deleted" },
          },
        },
      },
    },
    components: {
      schemas: {
        UserSchema,
        SubscriptionPackageSchema,
        CreateSubscriptionPackageSchema,
        UpdateSubscriptionPackageSchema,
        AdminStatsSchema,
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
