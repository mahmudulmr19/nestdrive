import { createFetchClient } from "@nestdrive/client";
import createOpenAPIReactQuery from "openapi-react-query";
import { env } from "./env";

export const createApiClient = () => {
  const api = createFetchClient(env.NEXT_PUBLIC_API_URL);
  api.use({
    onRequest({ request }) {
      if (typeof window === "undefined") return;
      const token = localStorage.getItem("token");
      if (token) {
        request.headers.set("Authorization", `Bearer ${token}`);
      }
      return request;
    },
  });
  return api;
};

export const fetchClient = createApiClient();
export const api = createOpenAPIReactQuery(fetchClient);
