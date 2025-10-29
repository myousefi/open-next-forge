import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const page = sqliteTable("Page", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
});

export type Page = typeof page.$inferSelect;
export type NewPage = typeof page.$inferInsert;
