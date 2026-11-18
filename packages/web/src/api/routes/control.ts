import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { admin } from "./event";
import { db } from "../database";
import {
  applications,
  materials,
  siteRoles,
  siteSettings,
} from "../database/schema";
import { configSchema, getConfig } from "../site-config";
export const control = {
  config: admin.handler(getConfig),
  saveConfig: admin.input(configSchema).handler(async ({ input }) => {
    await db
      .insert(siteSettings)
      .values({ id: 1, value: JSON.stringify(input) })
      .onConflictDoUpdate({
        target: siteSettings.id,
        set: { value: JSON.stringify(input) },
      });
    return { ok: true };
  }),
  roles: admin.handler(() => db.select().from(siteRoles)),
  saveRole: admin
    .input(
      z.object({
        id: z.number().optional(),
        name: z.string().trim().min(1).max(120),
        faction: z.enum(["Фонд", "ГОК"]),
        enabled: z.boolean(),
      }),
    )
    .handler(async ({ input }) => {
      if (input.id)
        await db.update(siteRoles).set(input).where(eq(siteRoles.id, input.id));
      else await db.insert(siteRoles).values(input);
      return { ok: true };
    }),
  deleteMaterial: admin
    .input(z.object({ id: z.number() }))
    .handler(async ({ input }) => {
      await db.delete(materials).where(eq(materials.id, input.id));
      return { ok: true };
    }),
  deleteRole: admin
    .input(z.object({ id: z.number() }))
    .handler(async ({ input }) => {
      if (
        (
          await db
            .select()
            .from(applications)
            .where(eq(applications.roleId, input.id))
        ).length
      )
        throw new ORPCError("CONFLICT", {
          message: "Есть заявки на эту роль: отключите её вместо удаления",
        });
      await db.delete(siteRoles).where(eq(siteRoles.id, input.id));
      return { ok: true };
    }),
  assign: admin
    .input(
      z.object({
        applicationId: z.number().optional(),
        roleId: z.number(),
        nickname: z.string().trim().min(2).max(60),
        discord: z.string().trim().min(2).max(100),
        status: z.enum(["approved", "pending", "rejected"]),
      }),
    )
    .handler(async ({ input }) => {
      const [role] = await db
        .select()
        .from(siteRoles)
        .where(eq(siteRoles.id, input.roleId));
      if (!role) throw new ORPCError("NOT_FOUND");
      if (input.status === "approved") {
        const others = await db
          .select()
          .from(applications)
          .where(
            and(
              eq(applications.roleId, input.roleId),
              eq(applications.status, "approved"),
            ),
          );
        if (others.some((a) => a.id !== input.applicationId))
          throw new ORPCError("CONFLICT", {
            message: "Роль уже занята другим игроком",
          });
      }
      const values = {
        roleId: input.roleId,
        nickname: input.nickname,
        discord: input.discord,
        status: input.status,
      };
      if (input.applicationId)
        await db
          .update(applications)
          .set(values)
          .where(eq(applications.id, input.applicationId));
      else
        await db
          .insert(applications)
          .values({
            ...values,
            note: "Назначен организатором",
            createdAt: new Date().toISOString(),
          });
      return { ok: true };
    }),
};
