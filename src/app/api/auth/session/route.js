import { NextResponse } from "next/server";
import { createSession } from "@/lib/auth";
import { adminAuth, adminDb } from "@/lib/firebase-admin";

export async function POST(request) {
  try {
    const { idToken, name } = await request.json();
    
    if (!idToken) {
      return NextResponse.json({ error: "No ID token provided" }, { status: 400 });
    }

    // Verify token to get UID
    const decodedClaims = await adminAuth.verifyIdToken(idToken);
    
    // Check if user document exists
    const userRef = adminDb.collection("users").doc(decodedClaims.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      // Create user document
      await userRef.set({
        name: name || decodedClaims.name || "User",
        email: decodedClaims.email,
        role: "STUDENT",
        createdAt: new Date(),
      });
      
      // Create an empty profile document
      await adminDb.collection("profiles").doc(decodedClaims.uid).set({
        userId: decodedClaims.uid,
        username: `user-${decodedClaims.uid.slice(0, 6)}`,
        isPublic: true,
        emailVisible: false,
        createdAt: new Date(),
      });
    }

    await createSession(idToken);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json({ error: "Failed to create session" }, { status: 401 });
  }
}
