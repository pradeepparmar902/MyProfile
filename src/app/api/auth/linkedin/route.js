import { NextResponse } from "next/server";

export async function GET(request) {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "LinkedIn credentials not configured. Please add LINKEDIN_CLIENT_ID and LINKEDIN_REDIRECT_URI to your environment variables." },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode");

  // Allow fallback to basic scopes to test connection if w_member_social is rejected
  const scope = mode === "basic"
    ? "openid profile email"
    : "openid profile email w_member_social";

  const state = Math.random().toString(36).substring(2); // CSRF protection

  const authUrl = new URL("https://www.linkedin.com/oauth/v2/authorization");
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("scope", scope);
  authUrl.searchParams.set("state", state);

  return NextResponse.redirect(authUrl.toString());
}
