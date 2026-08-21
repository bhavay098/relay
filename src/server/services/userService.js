import { setupCorsair } from "corsair";
import { corsair } from "../corsair.js";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";

export async function createUser(userId, email, name) {
  await db
    .insert(users)
    .values({ id: userId, email, name })
    .onConflictDoNothing({ target: users.id });

  await setupCorsair(corsair, { tenantId: userId });

  console.log(`User ${userId} created and Corsair tenant provisioned.`);
}
