import { getSessionUser } from "@/lib/auth";
import { error } from "@/lib/api";

export async function authenticated() {
  const user = await getSessionUser();
  if (!user) {
    return { response: error("Unauthorized", 401) };
  }
  return { user };
}

export function normalizeEnum(value, fallback) {
  return String(value || fallback)
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
}
