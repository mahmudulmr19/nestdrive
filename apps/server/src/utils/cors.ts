import { env } from "~/config/env";

export function getCorsOrigin(): string | string[] | true {
  const raw = env.CORS_ORIGIN?.trim();
  if (!raw || raw === "*") return true;
  return raw
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
}
