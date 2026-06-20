import { getSessionUser, publicUser } from "@/lib/auth";
import { json } from "@/lib/api";
import { getUserLimits } from "@/lib/plans";

export async function GET() {
  const user = await getSessionUser();
  const limits = user ? await getUserLimits(user.id) : null;
  return json({ user: publicUser(user), limits });
}
