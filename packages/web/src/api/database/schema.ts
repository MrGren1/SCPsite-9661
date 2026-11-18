import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
export * from "./auth-schema";
export const applications = sqliteTable("applications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nickname: text("nickname").notNull(),
  discord: text("discord").notNull(),
  roleId: integer("role_id").notNull(),
  note: text("note").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: text("created_at").notNull(),
});
export const materials = sqliteTable("materials", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  section: text("section").notNull(),
  hidden: integer("hidden", { mode: "boolean" }).notNull().default(false),
});
export const siteSettings = sqliteTable("site_settings", {
  id: integer("id").primaryKey(),
  value: text("value").notNull(),
});
export const siteRoles = sqliteTable("site_roles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  faction: text("faction").notNull(),
  enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
});
