// OAUTH CALLBACK ROUTE
// src/app/api/auth/[plugin]/callback/route.js

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { decodeOAuthState, processOAuthCallback } from "corsair/oauth";
import { corsair } from "@/server/corsair.js";

const SUCCESS_REDIRECT = "/dashboard?connected=true";
const ERROR_REDIRECT = "/dashboard?error=oauth_failed";

export async function GET(request, { params }) {
  const { plugin } = await params;
  const { searchParams } = new URL(request.url);

  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    console.error("OAuth callback missing code or state");
    return NextResponse.redirect(new URL(ERROR_REDIRECT, request.url));
  }

  const parsedState = decodeOAuthState(state);
  if (!parsedState) {
    console.error("OAuth callback: invalid or expired state");
    return NextResponse.redirect(new URL(ERROR_REDIRECT, request.url));
  }

  const { userId: sessionUserId } = await auth();

  if (!sessionUserId) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (parsedState.tenantId !== sessionUserId) {
    console.error("OAuth callback: state tenantId does not match session userId");
    return NextResponse.redirect(new URL(ERROR_REDIRECT, request.url));
  }

  if (parsedState.plugin !== plugin) {
    console.error("OAuth callback: state plugin does not match route plugin");
    return NextResponse.redirect(new URL(ERROR_REDIRECT, request.url));
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const redirectUri = `${appUrl}/api/auth/${plugin}/callback`;

  try {
    await processOAuthCallback(corsair, {
      code,
      state,
      redirectUri,
    });

    console.log(`User ${sessionUserId} successfully connected ${plugin}`);
    return NextResponse.redirect(new URL(SUCCESS_REDIRECT, request.url));
  } catch (error) {
    console.error(`OAuth callback error for ${plugin}:`, error);
    return NextResponse.redirect(new URL(ERROR_REDIRECT, request.url));
  }
}
