import { z } from "zod";
import { db } from "./database";
import { siteSettings } from "./database/schema";
const image = z
  .string()
  .max(2000)
  .refine(
    (v) => v.startsWith("/images/") || v.startsWith("https://"),
    "Изображение: путь /images/… или HTTPS URL",
  );
export const configSchema = z.object({
  title: z.string().min(1).max(160),
  description: z.string().max(4000),
  date: z.string().max(150),
  eyebrow: z.string().max(150),
  heroImage: image,
  foundationImage: image,
  gocImage: image,
  terminalImage: image,
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  background: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  terminalAccent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  applicationsOpen: z.boolean(),
  footer: z.string().max(1500),
  sections: z
    .array(
      z.object({
        id: z.enum(["home", "roles", "archive", "cassie", "rules"]),
        label: z.string().min(1).max(40),
        visible: z.boolean(),
      }),
    )
    .length(5)
    .refine(
      (a) =>
        new Set(a.map((x) => x.id)).size === 5 &&
        a.some((x) => x.id === "home" && x.visible),
      "Все разделы должны присутствовать, главная — видима",
    ),
});
export type SiteConfig = z.infer<typeof configSchema>;
export const defaults: SiteConfig = {
  title: "Участок\n№ 46.\nОбъект Фонда.",
  description:
    "Участок постоянного размещения, исследования и содержания.\nСовершенно секретный регулярный охраняемый объект Фонда.",
  date: "Не определена",
  eyebrow: "ВНУТРЕННИЙ ПОРТАЛ / УЧАСТОК № 46",
  heroImage: "/images/foundation.png",
  foundationImage: "/images/foundation.png",
  gocImage: "/images/goc.png",
  terminalImage: "/images/cassie-reference.png",
  accent: "#d8d8d2",
  background: "#090909",
  terminalAccent: "#70ef94",
  applicationsOpen: true,
  footer:
    "Фанатское событие SCP: Secret Laboratory. Не официальный сайт Фонда.",
  sections: [
    { id: "home", label: "Обзор", visible: true },
    { id: "roles", label: "Роли", visible: true },
    { id: "archive", label: "Архив", visible: true },
    { id: "cassie", label: "C.A.S.S.I.E.", visible: true },
    { id: "rules", label: "Регламент", visible: true },
  ],
};
export async function getConfig() {
  const [row] = await db.select().from(siteSettings);
  return row ? configSchema.parse(JSON.parse(row.value)) : defaults;
}
