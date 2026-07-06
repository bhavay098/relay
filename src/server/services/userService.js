import { setupCorsair } from "corsair";
import { corsair } from "../corsair.js";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

export async function createUser(userId, email, name) {
  await db
    .insert(users)
    .values({ id: userId, email, name })
    .onConflictDoNothing({ target: users.id });

  await setupCorsair(corsair, { tenantId: userId });

  console.log(`User ${userId} created and Corsair tenant provisioned.`);
}

export async function getUserById(userId) {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result[0] ?? null;
}
