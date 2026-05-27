import { getSessionUser, publicUser } from "@/lib/auth";
import { json } from "@/lib/api";

export async function GET() {
  const user = await getSessionUser();
  return json({ user: publicUser(user) });
}
