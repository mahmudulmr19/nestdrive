import createOpenAPIFetchClient, { type HeadersOptions } from "openapi-fetch";
import type { components, paths } from "./v1";

export const createFetchClient = (baseUrl: string, headers?: HeadersOptions) =>
  createOpenAPIFetchClient<paths>({
    baseUrl,
    headers: {
      ...(headers ? headers : {}),
    },
  });

export type { Middleware } from "openapi-fetch";
export type { components, operations, paths } from "./v1";
export type schemas = components["schemas"];
