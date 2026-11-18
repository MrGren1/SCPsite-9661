import { z } from "zod";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { base } from "../__core/app";
import { db } from "../database";
import { applications, materials, siteRoles } from "../database/schema";
import { getConfig } from "../site-config";
import { auth } from "../auth";
export const admin = base.use(async ({ context, next }) => {
  const session = await auth.api.getSession({ headers: context.headers });
  if (
    !session ||
    !session.user.emailVerified ||
    session.user.email.toLowerCase() !== "erali7401@gmail.com"
  )
    throw new ORPCError("FORBIDDEN", {
      message: "Доступ только для организатора",
    });
  return next();
});
export const event = {
  public: base.handler(async () => {
    const config = await getConfig();
    const visible = config.sections.filter((s) => s.visible).map((s) => s.id);
    const docs = (
      await db.select().from(materials).where(eq(materials.hidden, false))
    ).filter(
      (m) =>
        visible.includes(m.section === "info" ? "rules" : (m.section as any)) &&
        !["cassie", "secret"].includes(m.section),
    );
    return {
      config,
      roles: visible.includes("roles")
        ? await db.select().from(siteRoles).where(eq(siteRoles.enabled, true))
        : [],
      rules: docs.filter((m) => m.section === "rules").map((m) => m.body),
      info: docs.filter((m) => m.section === "info").map((m) => m.body),
      materials: docs,
      occupied: (
        await db
          .select()
          .from(applications)
          .where(eq(applications.status, "approved"))
      ).map((a) => a.roleId),
    };
  }),
  logs: base.handler(async () => {
    const config = await getConfig();
    if (!config.sections.some((s) => s.id === "cassie" && s.visible))
      throw new ORPCError("NOT_FOUND");
    const docs = await db
      .select()
      .from(materials)
      .where(
        and(
          eq(materials.hidden, false),
          sql`${materials.section} IN ('cassie','secret')`,
        ),
      );
    return {
      cassie: docs
        .filter((m) => m.section === "cassie")
        .map((m) => m.body)
        .join("\n\n"),
      materials: [],
      secret: docs.find((m) => m.section === "secret") ?? null,
    };
  }),
  apply: base
    .input(
      z.object({
        nickname: z.string().trim().min(2).max(60),
        discord: z.string().trim().min(2).max(100),
        roleId: z.number().int(),
        note: z.string().max(2000),
        consent: z.literal(true),
        website: z.string().max(0),
      }),
    )
    .handler(async ({ input }) => {
      const config = await getConfig();
      if (
        !config.applicationsOpen ||
        !config.sections.some((s) => s.id === "roles" && s.visible)
      )
        throw new ORPCError("FORBIDDEN", { message: "Приём заявок закрыт" });
      const [chosen] = await db
        .select()
        .from(siteRoles)
        .where(
          and(eq(siteRoles.id, input.roleId), eq(siteRoles.enabled, true)),
        );
      if (!chosen) throw new ORPCError("BAD_REQUEST");
      if (
        (
          await db
            .select()
            .from(applications)
            .where(
              and(
                eq(applications.roleId, input.roleId),
                eq(applications.status, "approved"),
              ),
            )
        ).length
      )
        throw new ORPCError("CONFLICT", { message: "Роль уже занята" });
      const recent = await db
        .select()
        .from(applications)
        .where(
          and(
            eq(applications.discord, input.discord),
            gte(
              applications.createdAt,
              new Date(Date.now() - 60000).toISOString(),
            ),
          ),
        );
      if (recent.length)
        throw new ORPCError("TOO_MANY_REQUESTS", {
          message: "Повторную заявку можно отправить через минуту",
        });
      const [saved] = await db
        .insert(applications)
        .values({
          nickname: input.nickname,
          discord: input.discord,
          roleId: input.roleId,
          note: input.note,
          createdAt: new Date().toISOString(),
        })
        .returning();
      return { id: saved.id };
    }),
  inbox: admin.handler(() =>
    db.select().from(applications).orderBy(desc(applications.id)),
  ),
  review: admin
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["approved", "rejected", "pending"]),
      }),
    )
    .handler(async ({ input }) => {
      const [app] = await db
        .select()
        .from(applications)
        .where(eq(applications.id, input.id));
      if (!app) throw new ORPCError("NOT_FOUND");
      if (input.status === "approved") {
        const other = await db
          .select()
          .from(applications)
          .where(
            and(
              eq(applications.roleId, app.roleId),
              eq(applications.status, "approved"),
            ),
          );
        if (other.some((a) => a.id !== app.id))
          throw new ORPCError("CONFLICT", {
            message: "На эту роль уже утверждён игрок",
          });
      }
      await db
        .update(applications)
        .set({ status: input.status })
        .where(eq(applications.id, input.id));
      return { ok: true };
    }),
  allMaterials: admin.handler(() => db.select().from(materials)),
  saveMaterial: admin
    .input(
      z.object({
        id: z.number().optional(),
        title: z.string().trim().min(1).max(150),
        body: z.string().max(30000),
        section: z.enum(["archive", "rules", "info", "cassie", "secret"]),
        hidden: z.boolean(),
      }),
    )
    .handler(async ({ input }) => {
      if (input.id)
        await db.update(materials).set(input).where(eq(materials.id, input.id));
      else await db.insert(materials).values(input);
      return { ok: true };
    }),
};
