import { db } from "@/lib/db";
import { authenticated } from "@/lib/crud";
import { json } from "@/lib/api";

export async function GET() {
  const { user, response } = await authenticated();
  if (response) return response;

  const fullUser = await db.user.findUnique({ where: { id: user.id } });

  const isConnected = !!(
    fullUser?.linkedinAccessToken &&
    fullUser?.linkedinTokenExpiry &&
    new Date() < new Date(fullUser.linkedinTokenExpiry)
  );

  return json({ connected: isConnected });
}
