import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { SiteConfig } from "../../api/site-config";
import {
  configOptions,
  saveConfigOptions,
  allRolesOptions,
  saveRoleOptions,
  deleteRoleOptions,
  materialsOptions,
  saveOptions,
  deleteMaterialOptions,
  inboxOptions,
  reviewOptions,
  assignOptions,
} from "../queries/event";
type Material = {
  id?: number;
  title: string;
  body: string;
  section: "archive" | "rules" | "info" | "cassie" | "secret";
  hidden: boolean;
};
type Role = {
  id?: number;
  name: string;
  faction: "Фонд" | "ГОК";
  enabled: boolean;
};
type Assignment = {
  applicationId?: number;
  roleId: number;
  nickname: string;
  discord: string;
  status: "pending" | "approved" | "rejected";
};
export function ControlPanel() {
  const [tab, setTab] = useState("applications"),
    [config, setConfig] = useState<SiteConfig | null>(null),
    [material, setMaterial] = useState<Material | null>(null),
    [role, setRole] = useState<Role | null>(null),
    [assignment, setAssignment] = useState<Assignment | null>(null),
    [notice, setNotice] = useState("");
  const settings = useQuery(configOptions()),
    roles = useQuery(allRolesOptions()),
    docs = useQuery(materialsOptions()),
    inbox = useQuery(inboxOptions());
  const saveConfig = useMutation(saveConfigOptions()),
    saveRole = useMutation(saveRoleOptions()),
    deleteRole = useMutation(deleteRoleOptions()),
    saveDoc = useMutation(saveOptions()),
    deleteDoc = useMutation(deleteMaterialOptions()),
    review = useMutation(reviewOptions()),
    assign = useMutation(assignOptions());
  const qc = useQueryClient();
  const done = () => {
    void qc.invalidateQueries();
    setNotice("Изменения сохранены");
  };
  const cfg = config ?? settings.data;
  const busy =
    saveConfig.isPending ||
    saveRole.isPending ||
    deleteRole.isPending ||
    saveDoc.isPending ||
    deleteDoc.isPending ||
    review.isPending ||
    assign.isPending;
  const error =
    settings.error ??
    roles.error ??
    docs.error ??
    inbox.error ??
    saveConfig.error ??
    saveRole.error ??
    deleteRole.error ??
    saveDoc.error ??
    deleteDoc.error ??
    review.error ??
    assign.error;
  const setField = <K extends keyof SiteConfig>(
    key: K,
    value: SiteConfig[K],
  ) => {
    if (cfg) setConfig({ ...cfg, [key]: value });
  };
  return (
    <div className="control-panel">
      <div className="control-tabs">
        {[
          ["applications", "Заявки"],
          ["homepage", "Главная"],
          ["materials", "Материалы"],
          ["roles", "Роли"],
          ["navigation", "Навигация"],
          ["theme", "Оформление"],
        ].map(([id, label]) => (
          <button
            key={id}
            className={tab === id ? "selected" : ""}
            onClick={() => {
              setTab(id);
              setNotice("");
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {error && <p className="danger">{error.message}</p>}
      {notice && (
        <output className="save-notice">
          {notice}
        </output>
      )}
      {(settings.isLoading ||
        roles.isLoading ||
        docs.isLoading ||
        inbox.isLoading) && <p>Загрузка кабинета…</p>}
      {["homepage", "navigation", "theme"].includes(tab) && cfg && (
        <form
          className="text-panel"
          onSubmit={(e) => {
            e.preventDefault();
            saveConfig.mutate(cfg, {
              onSuccess: () => {
                setConfig(null);
                done();
              },
            });
          }}
        >
          {tab === "homepage" && (
            <>
              <h3>Главная страница</h3>
              <label>
                Заголовок (переносы строк поддерживаются)
                <textarea
                  aria-label="Заголовок главной"
                  value={cfg.title}
                  onChange={(e) => setField("title", e.target.value)}
                />
              </label>
              <label>
                Описание
                <textarea
                  aria-label="Описание главной"
                  value={cfg.description}
                  onChange={(e) => setField("description", e.target.value)}
                />
              </label>
              <label>
                Подзаголовок
                <input
                  aria-label="Подзаголовок"
                  value={cfg.eyebrow}
                  onChange={(e) => setField("eyebrow", e.target.value)}
                />
              </label>
              <label>
                Дата / сообщение
                <input
                  aria-label="Дата события"
                  value={cfg.date}
                  onChange={(e) => setField("date", e.target.value)}
                />
              </label>
              <label>
                Текст внизу сайта
                <textarea
                  aria-label="Текст подвала"
                  value={cfg.footer}
                  onChange={(e) => setField("footer", e.target.value)}
                />
              </label>
              <label className="checkbox">
                <input
                  aria-label="Приём заявок открыт"
                  type="checkbox"
                  checked={cfg.applicationsOpen}
                  onChange={(e) =>
                    setField("applicationsOpen", e.target.checked)
                  }
                />
                Приём заявок открыт
              </label>
              <p className="muted">
                Внешние изображения настраиваются во вкладке «Оформление».
              </p>
            </>
          )}
          {tab === "navigation" && (
            <>
              <h3>Разделы и порядок навигации</h3>
              <p>
                Скрытый раздел не появляется в меню и недоступен игрокам.
                Главная остаётся видимой.
              </p>
              {cfg.sections.map((s, i) => (
                <div className="navigation-editor" key={s.id}>
                  <span>
                    {String(i + 1).padStart(2, "0")} / {s.id}
                  </span>
                  <input
                    aria-label={`Название ${s.id}`}
                    value={s.label}
                    onChange={(e) =>
                      setField(
                        "sections",
                        cfg.sections.map((x) =>
                          x.id === s.id ? { ...x, label: e.target.value } : x,
                        ),
                      )
                    }
                  />
                  <label className="checkbox">
                    <input
                      aria-label={`Показывать ${s.id}`}
                      type="checkbox"
                      disabled={s.id === "home"}
                      checked={s.visible}
                      onChange={(e) =>
                        setField(
                          "sections",
                          cfg.sections.map((x) =>
                            x.id === s.id
                              ? { ...x, visible: e.target.checked }
                              : x,
                          ),
                        )
                      }
                    />
                    Виден
                  </label>
                  <button
                    type="button"
                    disabled={i === 0}
                    onClick={() => {
                      const a = [...cfg.sections];
                      [a[i - 1], a[i]] = [a[i], a[i - 1]];
                      setField("sections", a);
                    }}
                  >
                    ↑ Выше
                  </button>
                  <button
                    type="button"
                    disabled={i === cfg.sections.length - 1}
                    onClick={() => {
                      const a = [...cfg.sections];
                      [a[i + 1], a[i]] = [a[i], a[i + 1]];
                      setField("sections", a);
                    }}
                  >
                    ↓ Ниже
                  </button>
                </div>
              ))}
            </>
          )}
          {tab === "theme" && (
            <>
              <h3>Цвета и изображения</h3>
              <p>
                Используйте HTTPS-ссылку на изображение или выберите один из
                загруженных файлов. HTML и скрипты в текстах не исполняются.
              </p>
              <div className="color-editor">
                {(
                  [
                    ["accent", "Основной акцент"],
                    ["background", "Фон сайта"],
                    ["terminalAccent", "Цвет C.A.S.S.I.E."],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key}>
                    {label}
                    <input
                      aria-label={label}
                      type="color"
                      value={cfg[key]}
                      onChange={(e) => setField(key, e.target.value)}
                    />
                    <span>{cfg[key]}</span>
                  </label>
                ))}
              </div>
              {(
                [
                  ["heroImage", "Картинка на главной"],
                  ["foundationImage", "Изображение Фонда"],
                  ["gocImage", "Изображение ГОК"],
                  ["terminalImage", "Изображение C.A.S.S.I.E."],
                ] as const
              ).map(([key, label]) => (
                <div className="asset-editor" key={key}>
                  <label>
                    {label}
                    <input
                      aria-label={label}
                      value={cfg[key]}
                      onChange={(e) => setField(key, e.target.value)}
                    />
                  </label>
                  <select
                    aria-label={`Готовое изображение: ${label}`}
                    value={cfg[key].startsWith("/images/") ? cfg[key] : ""}
                    onChange={(e) => {
                      if (e.target.value) setField(key, e.target.value);
                    }}
                  >
                    <option value="">Внешняя ссылка / другое</option>
                    <option value="/images/foundation.png">
                      Новая эмблема SCP
                    </option>
                    <option value="/images/goc.png">Новая эмблема ГОК</option>
                    <option value="/images/cassie-reference.png">
                      Терминал SCP
                    </option>
                    <option value="/images/Scp_Foundation_Card_CRaC8V.jpg">
                      Баннер SCP
                    </option>
                    <option value="/images/how_are_you__NSx-Tz.jpg">
                      Повреждённый материал
                    </option>
                  </select>
                  <img src={cfg[key]} alt={`Предпросмотр: ${label}`} />
                </div>
              ))}
            </>
          )}
          <button className="primary" disabled={busy}>
            {saveConfig.isPending ? "Сохранение…" : "Сохранить настройки"}
          </button>
        </form>
      )}
      {tab === "materials" && (
        <>
          <div className="panel-toolbar">
            <h3>Документы, правила и журналы</h3>
            <button
              className="primary"
              onClick={() =>
                setMaterial({
                  title: "",
                  body: "",
                  section: "archive",
                  hidden: false,
                })
              }
            >
              + Материал
            </button>
          </div>
          <p className="muted">
            Все исходные правила и логи доступны для редактирования.
            «Повреждённый сектор» открывается по команде в конце журнала.
          </p>
          {docs.data?.map((m) => (
            <article className="application" key={m.id}>
              <div>
                <small>
                  {m.section} / {m.hidden ? "Скрыт" : "Опубликован"}
                </small>
                <h3>{m.title}</h3>
              </div>
              <div className="review-buttons">
                <button
                  onClick={() =>
                    setMaterial({
                      ...m,
                      section: m.section as Material["section"],
                    })
                  }
                >
                  Редактировать
                </button>
                <button
                  disabled={busy}
                  onClick={() =>
                    saveDoc.mutate(
                      {
                        ...m,
                        section: m.section as Material["section"],
                        hidden: !m.hidden,
                      },
                      { onSuccess: done },
                    )
                  }
                >
                  {m.hidden ? "Опубликовать" : "Скрыть"}
                </button>
                <button
                  disabled={busy}
                  onClick={() => {
                    if (
                      window.confirm(
                        `Удалить материал «${m.title}»? Это необратимо.`,
                      )
                    )
                      deleteDoc.mutate({ id: m.id }, { onSuccess: done });
                  }}
                >
                  Удалить
                </button>
              </div>
            </article>
          ))}
          {material && (
            <form
              className="text-panel"
              onSubmit={(e) => {
                e.preventDefault();
                saveDoc.mutate(material, {
                  onSuccess: () => {
                    setMaterial(null);
                    done();
                  },
                });
              }}
            >
              <h3>Редактор материала</h3>
              <label>
                Заголовок
                <input
                  aria-label="Заголовок материала"
                  required
                  maxLength={150}
                  value={material.title}
                  onChange={(e) =>
                    setMaterial({ ...material, title: e.target.value })
                  }
                />
              </label>
              <label>
                Раздел
                <select
                  aria-label="Раздел материала"
                  value={material.section}
                  onChange={(e) =>
                    setMaterial({
                      ...material,
                      section: e.target.value as Material["section"],
                    })
                  }
                >
                  {[
                    ["archive", "Архив"],
                    ["rules", "Правила"],
                    ["info", "Важная информация"],
                    ["cassie", "C.A.S.S.I.E."],
                    ["secret", "Повреждённый сектор"],
                  ].map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Текст
                <textarea
                  aria-label="Текст материала"
                  rows={14}
                  value={material.body}
                  onChange={(e) =>
                    setMaterial({ ...material, body: e.target.value })
                  }
                />
              </label>
              <label className="checkbox">
                <input
                  aria-label="Скрытый материал"
                  type="checkbox"
                  checked={material.hidden}
                  onChange={(e) =>
                    setMaterial({ ...material, hidden: e.target.checked })
                  }
                />
                Скрыть от игроков
              </label>
              <div className="hero-actions">
                <button className="primary" disabled={busy}>
                  Сохранить материал
                </button>
                <button type="button" onClick={() => setMaterial(null)}>
                  Отмена
                </button>
              </div>
            </form>
          )}
        </>
      )}
      {tab === "roles" && (
        <>
          <div className="panel-toolbar">
            <h3>Должности и доступность</h3>
            <button
              className="primary"
              onClick={() =>
                setRole({ name: "", faction: "Фонд", enabled: true })
              }
            >
              + Роль
            </button>
          </div>
          {roles.data?.map((r) => (
            <article className="application" key={r.id}>
              <div>
                <small>
                  #{r.id} / {r.faction} / {r.enabled ? "Открыта" : "Отключена"}
                </small>
                <h3>{r.name}</h3>
              </div>
              <div className="review-buttons">
                <button
                  onClick={() =>
                    setRole({ ...r, faction: r.faction as Role["faction"] })
                  }
                >
                  Редактировать
                </button>
                <button
                  disabled={busy}
                  onClick={() =>
                    saveRole.mutate(
                      {
                        ...r,
                        faction: r.faction as Role["faction"],
                        enabled: !r.enabled,
                      },
                      { onSuccess: done },
                    )
                  }
                >
                  {r.enabled ? "Отключить" : "Открыть"}
                </button>
                <button
                  disabled={busy}
                  onClick={() => {
                    if (window.confirm(`Удалить роль «${r.name}»?`))
                      deleteRole.mutate({ id: r.id }, { onSuccess: done });
                  }}
                >
                  Удалить
                </button>
              </div>
            </article>
          ))}
          {role && (
            <form
              className="text-panel"
              onSubmit={(e) => {
                e.preventDefault();
                saveRole.mutate(role, {
                  onSuccess: () => {
                    setRole(null);
                    done();
                  },
                });
              }}
            >
              <h3>Редактор роли</h3>
              <label>
                Должность
                <input
                  aria-label="Название роли"
                  required
                  value={role.name}
                  onChange={(e) => setRole({ ...role, name: e.target.value })}
                />
              </label>
              <label>
                Фракция
                <select
                  aria-label="Фракция"
                  value={role.faction}
                  onChange={(e) =>
                    setRole({
                      ...role,
                      faction: e.target.value as Role["faction"],
                    })
                  }
                >
                  <option>Фонд</option>
                  <option>ГОК</option>
                </select>
              </label>
              <label className="checkbox">
                <input
                  aria-label="Роль доступна"
                  type="checkbox"
                  checked={role.enabled}
                  onChange={(e) =>
                    setRole({ ...role, enabled: e.target.checked })
                  }
                />
                Доступна для заявок
              </label>
              <div className="hero-actions">
                <button className="primary" disabled={busy}>
                  Сохранить роль
                </button>
                <button type="button" onClick={() => setRole(null)}>
                  Отмена
                </button>
              </div>
            </form>
          )}
        </>
      )}
      {tab === "applications" && (
        <>
          <div className="panel-toolbar">
            <h3>
              Заявки / {cfg?.applicationsOpen ? "приём открыт" : "приём закрыт"}
            </h3>
            <button
              className="primary"
              onClick={() =>
                setAssignment({
                  nickname: "",
                  discord: "",
                  roleId: roles.data?.[0]?.id ?? 1,
                  status: "approved",
                })
              }
            >
              Назначить игрока
            </button>
          </div>
          {!inbox.isLoading && !inbox.data?.length && (
            <div className="empty">
              <h3>Пока нет заявок</h3>
              <p>
                Здесь появятся данные игроков. Discord указан вручную и не
                подтверждён.
              </p>
            </div>
          )}
          {inbox.data?.map((a) => (
            <article className="application" key={a.id}>
              <div>
                <small>
                  #{a.id} / {new Date(a.createdAt).toLocaleString("ru-RU")}
                </small>
                <h3>
                  {a.nickname}{" "}
                  <span className="tag">
                    {a.status === "approved"
                      ? "Подтверждена"
                      : a.status === "rejected"
                        ? "Отклонена"
                        : "На рассмотрении"}
                  </span>
                </h3>
                <p>
                  {roles.data?.find((r) => r.id === a.roleId)?.name ??
                    `Роль #${a.roleId}`}
                </p>
                <p>Discord: {a.discord} (не подтверждён)</p>
                <p>{a.note}</p>
              </div>
              <div className="review-buttons">
                {(["approved", "rejected", "pending"] as const).map((s, i) => (
                  <button
                    key={s}
                    disabled={busy}
                    onClick={() =>
                      review.mutate(
                        { id: a.id, status: s },
                        { onSuccess: done },
                      )
                    }
                  >
                    {["Подтвердить", "Отклонить", "На рассмотрение"][i]}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setAssignment({
                      applicationId: a.id,
                      roleId: a.roleId,
                      nickname: a.nickname,
                      discord: a.discord,
                      status: a.status as Assignment["status"],
                    })
                  }
                >
                  Изменить роль / игрока
                </button>
              </div>
            </article>
          ))}
          {assignment && (
            <form
              className="text-panel"
              onSubmit={(e) => {
                e.preventDefault();
                assign.mutate(assignment, {
                  onSuccess: () => {
                    setAssignment(null);
                    done();
                  },
                });
              }}
            >
              <h3>Назначение игрока</h3>
              <label>
                Ник
                <input
                  aria-label="Ник назначаемого игрока"
                  required
                  minLength={2}
                  value={assignment.nickname}
                  onChange={(e) =>
                    setAssignment({ ...assignment, nickname: e.target.value })
                  }
                />
              </label>
              <label>
                Discord
                <input
                  aria-label="Discord назначаемого игрока"
                  required
                  minLength={2}
                  value={assignment.discord}
                  onChange={(e) =>
                    setAssignment({ ...assignment, discord: e.target.value })
                  }
                />
              </label>
              <label>
                Роль
                <select
                  aria-label="Назначаемая роль"
                  value={assignment.roleId}
                  onChange={(e) =>
                    setAssignment({
                      ...assignment,
                      roleId: Number(e.target.value),
                    })
                  }
                >
                  {roles.data?.map((r) => (
                    <option key={r.id} value={r.id}>
                      #{r.id} {r.name} / {r.faction}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Статус
                <select
                  aria-label="Статус назначения"
                  value={assignment.status}
                  onChange={(e) =>
                    setAssignment({
                      ...assignment,
                      status: e.target.value as Assignment["status"],
                    })
                  }
                >
                  <option value="pending">На рассмотрении</option>
                  <option value="approved">Подтверждена</option>
                  <option value="rejected">Отклонена</option>
                </select>
              </label>
              <div className="hero-actions">
                <button className="primary" disabled={busy}>
                  Сохранить назначение
                </button>
                <button type="button" onClick={() => setAssignment(null)}>
                  Отмена
                </button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
}
