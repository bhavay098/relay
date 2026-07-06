import "dotenv/config";
import { pool } from "./db/index.js";
import { createCorsair } from "corsair";
import { gmail } from "@corsair-dev/gmail";
import { googlecalendar } from "@corsair-dev/googlecalendar";

export const corsair = createCorsair({
  multiTenancy: true,
  plugins: [
    gmail({
      authType: "oauth_2",
      credentials: {
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
      },
    }),
    googlecalendar({
      authType: "oauth_2",
      credentials: {
        clientId: process.env.GOOGLE_CALENDAR_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET,
      },
    }),
  ],
  database: pool,
  kek: process.env.CORSAIR_KEK,
});
