import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  ArrowUpRight,
  ArrowRight,
  Shield,
  LockKeyhole,
  FileText,
  Terminal,
  X,
  Check,
  ChevronRight,
  Menu,
} from "lucide-react";
import { publicOptions, logOptions, applyOptions } from "../queries/event";
import { ControlPanel } from "../components/control-panel";
import { authClient } from "../lib/auth";
export default function Network() {
  const [tab, setTab] = useState(
      window.location.pathname === "/organizer" ? "admin" : "home",
    ),
    [mobile, setMobile] = useState(false),
    [faction, setFaction] = useState("Все"),
    [search, setSearch] = useState(""),
    [role, setRole] = useState<number | null>(null),
    [sent, setSent] = useState<number | null>(null),
    [secret, setSecret] = useState(false),
    [doc, setDoc] = useState<{ title: string; body: string } | null>(null),
    [authError, setAuthError] = useState("");
  const data = useQuery(publicOptions());
  const logs = useQuery(logOptions(tab === "cassie"));
  const apply = useMutation(applyOptions());
  const session = authClient.useSession();
  const cfg = data.data?.config;
  const available = (id: string) =>
    cfg?.sections.some((s) => s.id === id && s.visible) ?? id === "home";
  const isTerminal = tab === "cassie";
  const navigate = (t: string) => {
    if (t !== "admin" && !available(t)) return;
    setTab(t);
    setMobile(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  useEffect(()=>{const close=(e:KeyboardEvent)=>{if(e.key==="Escape")setMobile(false);};document.addEventListener("keydown",close);return ()=>document.removeEventListener("keydown",close);},[]);
  const selected = data.data?.roles.find((r) => r.id === role);
  const login = async () => {
    setAuthError("");
    try {
      const result = await authClient.managedAuth.signIn({
        provider: "google",
      });
      if (result.error)
        setAuthError(result.error.message ?? "Не удалось войти");
    } catch {
      setAuthError("Не удалось открыть вход. Попробуйте ещё раз.");
    }
  };
  return (
    <div
      className={`network strict-network ${isTerminal ? "terminal-mode" : ""}`}
      style={
        {
          "--blue": isTerminal
            ? (cfg?.terminalAccent ?? "#70ef94")
            : (cfg?.accent ?? "#d8d8d2"),
          "--site-bg": cfg?.background ?? "#090909",
        } as React.CSSProperties
      }
    >
      <header>
        <button className="brand" onClick={() => navigate("home")}>
          <span className="brand-icon">
            <Shield size={21} />
          </span>
          <span>
            SCP FOUNDATION<small>SECURE. CONTAIN. PROTECT.</small>
          </span>
        </button>
        <div className="navigation-anchor">
          <button
            className={`navigation-trigger ${mobile ? "expanded" : ""}`}
            aria-expanded={mobile}
            aria-controls="network-navigation"
            onClick={() => setMobile(!mobile)}
          >
            <Menu size={16} />
            <span>Навигация</span>
            <span>{mobile ? "−" : "+"}</span>
          </button>
          {mobile && (
            <nav
              id="network-navigation"
              className="navigation-popover"
              aria-label="Разделы сети"
            >
              <div className="navigation-caption">
                {isTerminal
                  ? "C.A.S.S.I.E. / DIRECTORY"
                  : "КАТАЛОГ ВНУТРЕННЕЙ СЕТИ"}
              </div>
              {cfg?.sections
                .filter((s) => s.visible)
                .map((item, i) => (
                  <button
                    className={tab === item.id ? "active" : ""}
                    onClick={() => navigate(item.id)}
                    key={item.id}
                  >
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <strong>{item.label}</strong>
                    <ArrowUpRight size={15} />
                  </button>
                ))}
            </nav>
          )}
        </div>
        {session.data?.user.email.toLowerCase() === "erali7401@gmail.com" && (
          <button className="cabinet" onClick={() => navigate("admin")}>
            <LockKeyhole size={13} />
            <span>Кабинет</span>
            <ArrowUpRight size={13} />
          </button>
        )}
      </header>
      <div className="statusbar">
        <span>
          <i /> ВНУТРЕННЯЯ СЕТЬ ФОНДА
        </span>
        <span>
          УЗЕЛ RU-046 <b>/</b> КАНАЛ ЗАЩИЩЁН
        </span>
        <span className="right-status">ДОСТУП: ИНФОРМАЦИОННЫЙ</span>
      </div>
      <main>
        {tab === "home" && (
          <>
            <section className="hero">
              <div className="hero-copy">
                <div className="eyebrow">
                  <span className="tiny-square" />
                  {cfg?.eyebrow ?? "ВНУТРЕННИЙ ПОРТАЛ / RU-046"}
                </div>
                <h1 className="editable-title">
                  {cfg?.title ?? "Участок\n№ 46.\nОбъект Фонда."}
                </h1>
                <p className="editable-description">
                  {cfg?.description ?? "Подключение к информационной сети…"}
                </p>
                <div className="hero-actions">
                  <button className="primary" onClick={() => navigate("roles")}>
                    Выбрать роль <ArrowUpRight size={17} />
                  </button>
                  <button
                    className="secondary"
                    onClick={() => navigate("archive")}
                  >
                    Открыть досье <FileText size={15} />
                  </button>
                </div>
                <div className="hero-meta">
                  <span>
                    ОБЪЕКТ <b>RU-046</b>
                  </span>
                  <span>
                    ДАТА <b>{cfg?.date ?? "Не определена"}</b>
                  </span>
                </div>
              </div>
              <div className="site-identity">
                <div className="site-image">
                  <img
                    src={cfg?.heroImage ?? "/images/foundation.png"}
                    alt="Эмблема Фонда SCP"
                  />
                  <span className="identity-corner">FOUNDATION / RU-046</span>
                </div>
                <div className="identity-caption">
                  <span>
                    <i /> РЕЕСТР ОБЪЕКТОВ
                  </span>
                  <span>УЧАСТОК № 46</span>
                </div>
                <div className="identity-label">
                  <span>SECURE.</span>
                  <span>CONTAIN.</span>
                  <span>PROTECT.</span>
                </div>
              </div>
            </section>
            <div className="metrics">
              <div>
                <b>46</b>
                <span>НОМЕР УЧАСТКА</span>
              </div>
              <div>
                <b>
                  {data.data?.roles.filter((r) => r.faction === "Фонд")
                    .length ?? "24"}
                </b>
                <span>РОЛИ ФОНДА</span>
              </div>
              <div>
                <b>
                  {data.data?.roles.filter((r) => r.faction === "ГОК").length ??
                    0}
                </b>
                <span>РОЛИ ГОК</span>
              </div>
              <div>
                <b className="blue">RP</b>
                <span>РОЛЕВОЕ СОБЫТИЕ</span>
              </div>
            </div>
            <section className="section">
              <SectionTitle
                number="01"
                title="Выберите свою сторону"
                label={
                  cfg?.applicationsOpen
                    ? "ЛИЧНЫЙ СОСТАВ / НАБОР ОТКРЫТ"
                    : "ЛИЧНЫЙ СОСТАВ / НАБОР ЗАКРЫТ"
                }
              />
              <div className="factions">
                <Faction
                  name="Фонд SCP"
                  code="SCP / FOUNDATION"
                  text="Научный персонал, служба безопасности, медики и инженеры. Те, кто привык обезопасить, сдержать и защитить."
                  image={cfg?.foundationImage ?? "/images/foundation.png"}
                  onClick={() => {
                    setFaction("Фонд");
                    navigate("roles");
                  }}
                />
                <Faction
                  name="Глобальная Оккультная Коалиция"
                  code="GOC / UNITED NATIONS"
                  text="Защищать человечество от любого врага. Хочет оно того или нет. Командование, оперативники и медицинская поддержка."
                  image={cfg?.gocImage ?? "/images/goc.png"}
                  onClick={() => {
                    setFaction("ГОК");
                    navigate("roles");
                  }}
                />
              </div>
            </section>
            <section className="section">
              <SectionTitle
                number="02"
                title="Информационные ресурсы"
                label="ВНУТРЕННИЙ АРХИВ"
              />
              <div className="resources">
                {[
                  [
                    "archive",
                    "Архив документов",
                    "Справочники и памятки персоналу",
                    FileText,
                  ],
                  [
                    "cassie",
                    "Журналы C.A.S.S.I.E.",
                    "Отдельный системный терминал",
                    Terminal,
                  ],
                  [
                    "rules",
                    "Регламент события",
                    "Правила отыгровки и важная информация",
                    Shield,
                  ],
                ]
                  .filter(([id]) => available(String(id)))
                  .map(([id, title, text, Icon]: any) => (
                    <button key={id} onClick={() => navigate(id)}>
                      <Icon size={23} />
                      <h3>{title}</h3>
                      <p>{text}</p>
                      <ArrowUpRight className="resource-arrow" size={17} />
                    </button>
                  ))}
              </div>
            </section>
            <section className="bottom-cta">
              <div className="eyebrow">ВАШЕ РЕШЕНИЕ ИМЕЕТ ЗНАЧЕНИЕ</div>
              <h2>
                История не написана.
                <br />
                <span>Станьте её частью.</span>
              </h2>
              <button className="primary" onClick={() => navigate("roles")}>
                Подать заявку <ArrowUpRight size={17} />
              </button>
              <p>
                {cfg?.date ?? "Дата проведения будет объявлена организатором."}
              </p>
            </section>
          </>
        )}
        {tab === "roles" && available("roles") && (
          <section className="page-section">
            <SectionTitle
              number="PERSONNEL"
              title="Распределение ролей"
              label="ЗАЯВКИ РАССМАТРИВАЕТ ОРГАНИЗАТОР"
            />
            <p className="intro">
              Выберите должность и отправьте заявку. Место закрепляется после
              подтверждения организатором.
            </p>
            {!cfg?.applicationsOpen && (
              <div className="notice">
                <p>Приём заявок временно закрыт организатором.</p>
              </div>
            )}
            <div className="filters">
              <div>
                {["Все", "Фонд", "ГОК"].map((f) => (
                  <button
                    className={faction === f ? "selected" : ""}
                    onClick={() => setFaction(f)}
                    key={f}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <input
                placeholder="Поиск должности…"
                aria-label="Поиск роли"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {data.isLoading ? (
              <p>Загрузка личного состава…</p>
            ) : data.error ? (
              <p className="danger">
                Не удалось загрузить роли.{" "}
                <button onClick={() => data.refetch()}>Повторить</button>
              </p>
            ) : (
              <div className="role-table">
                <div className="role-row table-head">
                  <span>ДОЛЖНОСТЬ / ПОЗИЦИЯ</span>
                  <span>ФРАКЦИЯ</span>
                  <span>СТАТУС</span>
                  <span />
                </div>
                {data.data?.roles
                  .filter(
                    (r) =>
                      (faction === "Все" || r.faction === faction) &&
                      r.name.toLowerCase().includes(search.toLowerCase()),
                  )
                  .map((r) => (
                    <div className="role-row" key={r.id}>
                      <span>
                        <small>{String(r.id).padStart(2, "0")}</small>
                        {r.name}
                      </span>
                      <span className="muted">{r.faction}</span>
                      <span
                        className={
                          data.data.occupied.includes(r.id) ? "muted" : "blue"
                        }
                      >
                        {data.data.occupied.includes(r.id)
                          ? "Занята"
                          : "Открыта"}
                      </span>
                      <button
                        disabled={
                          !cfg?.applicationsOpen ||
                          data.data.occupied.includes(r.id)
                        }
                        onClick={() => {
                          setRole(r.id);
                          setSent(null);
                          apply.reset();
                        }}
                      >
                        Заявка <ArrowUpRight size={14} />
                      </button>
                    </div>
                  ))}
              </div>
            )}
          </section>
        )}
        {tab === "archive" && available("archive") && (
          <section className="page-section">
            <SectionTitle
              number="ARCHIVE"
              title="Справочный архив"
              label="ПАМЯТКИ ПЕРСОНАЛУ / RU-046"
            />
            <p className="intro">
              Опубликованные документы внутренней сети. Без сюжетных раскрытий.
            </p>
            <div className="document-list">
              {data.data?.materials
                .filter((m) => m.section === "archive")
                .map((m) => (
                  <button key={m.id} onClick={() => setDoc(m)}>
                    <FileText />
                    <div>
                      <small>DOC / {m.id}</small>
                      <h3>{m.title}</h3>
                    </div>
                    <ArrowUpRight />
                  </button>
                ))}
            </div>
          </section>
        )}
        {tab === "cassie" && available("cassie") && (
          <section className="page-section cassie-page">
            <SectionTitle
              number="SYSTEM"
              title="C.A.S.S.I.E."
              label="ЦЕНТРАЛЬНЫЙ ДИСК / ЖУРНАЛ СОБЫТИЙ"
            />
            <div className="terminal-banner">
              <img
                src={cfg?.terminalImage ?? "/images/cassie-reference.png"}
                alt="Системный интерфейс C.A.S.S.I.E."
              />
              <div>
                <small>FOUNDATION OPERATING SYSTEM</small>
                <h3>C.A.S.S.I.E.</h3>
                <span>READ-ONLY / CENTRAL DISK 046</span>
              </div>
            </div>
            <div className="full-terminal">
              <div className="console-head">
                <span>
                  <i /> ARCHIVED SESSION / 046
                </span>
                <span>READ ONLY</span>
              </div>
              <pre>
                {logs.isLoading
                  ? "Подключение к центральному диску…"
                  : (logs.data?.cassie ?? "Журнал недоступен")}
              </pre>
              {logs.data?.secret && (
                <button
                  className="terminal-link"
                  onClick={() => setSecret(true)}
                >
                  root@foundation:~$ восстановить повреждённый сектор{" "}
                  <ChevronRight size={14} />
                </button>
              )}
            </div>
            {logs.data?.materials
              .filter((m) => m.section === "cassie")
              .map((m) => (
                <article className="text-panel" key={m.id}>
                  <h3>{m.title}</h3>
                  <pre>{m.body}</pre>
                </article>
              ))}
          </section>
        )}
        {tab === "rules" && available("rules") && (
          <section className="page-section">
            <SectionTitle
              number="REGULATIONS"
              title="Регламент события"
              label="ОБЯЗАТЕЛЬНО К ПРОЧТЕНИЮ"
            />
            <h3 className="subheading">Правила отыгровки</h3>
            <div className="rules-list">
              {data.data?.rules.map((r, i) => (
                <article key={i}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <p>{r}</p>
                </article>
              ))}
            </div>
            <h3 className="subheading">Важная информация</h3>
            <div className="rules-list">
              {data.data?.info.map((r, i) => (
                <article key={i}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <p>{r}</p>
                </article>
              ))}
            </div>
          </section>
        )}
        {tab === "admin" && (
          <section className="page-section">
            <SectionTitle
              number="CONTROL"
              title="Кабинет организатора"
              label="ОГРАНИЧЕННЫЙ ДОСТУП"
            />
            {session.isPending ? (
              <p>Проверка доступа…</p>
            ) : !session.data ? (
              <div className="login-panel">
                <LockKeyhole size={32} />
                <h3>Вход в защищённый контур</h3>
                <p>
                  Войдите через Google. Доступ разрешён только организатору
                  события.
                </p>
                <button className="primary" onClick={login}>
                  Войти через Google <ArrowUpRight size={16} />
                </button>
                {authError && <p className="danger">{authError}</p>}
              </div>
            ) : session.data.user.email.toLowerCase() !==
              "erali7401@gmail.com" ? (
              <div className="login-panel">
                <h3>Доступ запрещён</h3>
                <p>Этот аккаунт не имеет прав организатора.</p>
                <button onClick={() => authClient.signOut()}>Выйти</button>
              </div>
            ) : (
              <>
                <div className="admin-top">
                  <span>{session.data.user.email}</span>
                  <button onClick={() => authClient.signOut()}>
                    Завершить сеанс
                  </button>
                </div>
                <ControlPanel />
              </>
            )}
          </section>
        )}
      </main>
      <footer>
        <div className="footer-top">
          <button className="brand" onClick={() => navigate("home")}>
            <Shield size={24} />
            <span>
              SCP FOUNDATION<small>ВНУТРЕННЯЯ СЕТЬ / RU-046</small>
            </span>
          </button>
          <div>
            <span className="blue">S — ОБЕЗОПАСИТЬ</span>
            <span>C — СДЕРЖАТЬ</span>
            <span>P — ЗАЩИТИТЬ</span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            {cfg?.footer ?? "Фанатское событие SCP: Secret Laboratory."}
          </span>
          <a
            href="https://scpfoundation.net/about-the-scp-foundation"
            target="_blank"
            rel="noreferrer"
          >
            О вселенной SCP ↗
          </a>
        </div>
        <div className="credits">
          Изображения предоставлены организатором; Artwork by Navla
          (Logos&amp;Draws). Материалы SCP — CC BY-SA 3.0; права на прочие
          изображения принадлежат их авторам.
        </div>
      </footer>
      {role !== null && (
        <ModalFrame className="modal" onClose={() => setRole(null)}>
          <button
            className="close"
            aria-label="Закрыть"
            onClick={() => setRole(null)}
          >
            <X />
          </button>
          {sent ? (
            <div className="success">
              <Check size={35} />
              <h2>Заявка зарегистрирована</h2>
              <p>
                Номер #{sent}. Организатор рассмотрит её и свяжется с вами по
                указанному Discord. Роль пока не закреплена.
              </p>
              <button className="primary" onClick={() => setRole(null)}>
                Готово
              </button>
            </div>
          ) : (
            <>
              <div className="eyebrow">PERSONNEL / APPLICATION</div>
              <h2>Заявка на роль</h2>
              <p className="blue">{selected?.name}</p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  apply.mutate(
                    {
                      roleId: role,
                      nickname: String(f.get("nickname")),
                      discord: String(f.get("discord")),
                      note: String(f.get("note")),
                      consent: true,
                      website: String(f.get("website") ?? ""),
                    },
                    { onSuccess: (r) => setSent(r.id) },
                  );
                }}
              >
                <label>
                  Игровой ник
                  <input
                    aria-label="Поле формы"
                    name="nickname"
                    required
                    minLength={2}
                    maxLength={60}
                    placeholder="Ваш ник на сервере"
                  />
                </label>
                <label>
                  Discord
                  <input
                    aria-label="Поле формы"
                    name="discord"
                    required
                    minLength={2}
                    maxLength={100}
                    placeholder="Имя пользователя или user ID"
                  />
                </label>
                <small className="muted">
                  Указывается вручную. Discord не подтверждён авторизацией.
                </small>
                <label>
                  О персонаже / комментарий
                  <textarea
                    aria-label="Текст материала или комментария"
                    name="note"
                    maxLength={2000}
                    placeholder="Опыт отыгровки, идея персонажа…"
                  />
                </label>
                <input
                  aria-label="Поле формы"
                  className="honeypot"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                />
                <label className="checkbox">
                  <input
                    aria-label="Согласие с регламентом и обработкой заявки"
                    type="checkbox"
                    required
                  />
                  Я прочитал регламент и согласен передать ник и Discord
                  организатору для рассмотрения заявки.
                </label>
                {apply.error && <p className="danger">{apply.error.message}</p>}
                <button className="primary" disabled={apply.isPending}>
                  {apply.isPending ? "Отправка…" : "Отправить организатору"}
                  <ArrowRight size={16} />
                </button>
              </form>
            </>
          )}
        </ModalFrame>
      )}
      {doc && (
        <ModalFrame className="modal wide" onClose={() => setDoc(null)}>
          <button
            className="close"
            onClick={() => setDoc(null)}
            aria-label="Закрыть"
          >
            <X />
          </button>
          <div className="eyebrow">FOUNDATION / DOCUMENT</div>
          <h2>{doc.title}</h2>
          <pre className="document-body">
            {doc.body.replace(/\n{3,}/g, "\n\n")}
          </pre>
        </ModalFrame>
      )}
      {secret && logs.data?.secret && (
        <ModalFrame
          className="modal secret cassie-page"
          onClose={() => setSecret(false)}
        >
          <button
            className="close"
            onClick={() => setSecret(false)}
            aria-label="Закрыть"
          >
            <X />
          </button>
          <div className="eyebrow">ПОВРЕЖДЁННЫЙ СЕКТОР / ВОССТАНОВЛЕНО</div>
          <h2>{logs.data.secret.title}</h2>
          <pre className="document-body">{logs.data.secret.body}</pre>
        </ModalFrame>
      )}
    </div>
  );
}
function SectionTitle({
  number,
  title,
  label,
}: {
  number: string;
  title: string;
  label: string;
}) {
  return (
    <div className="section-title">
      <div>
        <span className="section-code">/{number}</span>
        <h2>
          <span>[</span> {title} <span>]</span>
        </h2>
      </div>
      <small>{label}</small>
    </div>
  );
}
function Faction({ name, code, text, image, onClick }: any) {
  return (
    <article className="faction-card">
      <img src={image} alt={name} />
      <div className="faction-content">
        <small>{code}</small>
        <h3>{name}</h3>
        <p>{text}</p>
        <button onClick={onClick}>
          Посмотреть роли <ArrowUpRight size={16} />
        </button>
      </div>
    </article>
  );
}
function ModalFrame({
  children,
  className,
  onClose,
}: {
  children: React.ReactNode;
  className: string;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog ref={ref} className={className} onCancel={onClose}>
      {children}
    </dialog>
  );
}
