// OAUTH CONNECT ROUTE
// src/app/api/auth/[plugin]/connect/route.js

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { generateOAuthUrl } from "corsair/oauth";
import { corsair } from "@/server/corsair.js";

const SUPPORTED_PLUGINS = ["gmail", "googlecalendar"];

export async function GET(request, { params }) {
  const { plugin } = await params;

  if (!SUPPORTED_PLUGINS.includes(plugin)) {
    return NextResponse.json(
      { error: `Unknown plugin: ${plugin}` },
      { status: 400 },
    );
  }

  const { userId } = await auth();

  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/${plugin}/callback`;

  try {
    const { url } = await generateOAuthUrl(corsair, plugin, {
      tenantId: userId,
      redirectUri,
    });

    return NextResponse.redirect(url);
  } catch (error) {
    console.error(`OAuth connect error for ${plugin}:`, error);
    return NextResponse.redirect(
      new URL("/dashboard?error=oauth_failed", request.url),
    );
  }
}
