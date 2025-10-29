import { eq } from "drizzle-orm";
import { getDatabase, page } from "@repo/database";

export const GET = async () => {
  const db = await getDatabase();
  const temporaryName = `cron-temp-${crypto.randomUUID()}`;

  await db.insert(page).values({ name: temporaryName });

  await db.delete(page).where(eq(page.name, temporaryName));

  return new Response("OK", { status: 200 });
};
