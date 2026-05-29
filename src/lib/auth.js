import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

const cookieName = "proofolio_session";

export async function createSession(idToken) {
  try {
    const expiresIn = 60 * 60 * 24 * 7 * 1000; // 7 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const cookieStore = await cookies();
    cookieStore.set(cookieName, sessionCookie, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  } catch (error) {
    console.error("Error creating session cookie:", error);
    throw error;
  }
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(cookieName)?.value;

  if (!sessionCookie) return null;

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    
    // Fetch user from Firestore
    const userDoc = await adminDb.collection("users").doc(decodedClaims.uid).get();
    
    if (!userDoc.exists) {
      return {
        id: decodedClaims.uid,
        email: decodedClaims.email,
        name: decodedClaims.name || "User",
      };
    }
    
    return { id: userDoc.id, ...userDoc.data() };
  } catch (error) {
    return null;
  }
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) {
    return null;
  }
  return user;
}

export function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    profile: user.profile,
  };
}
