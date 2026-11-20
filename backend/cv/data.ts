import "server-only";
import repository from "@/backend/repository";
import { getExcludedSkillIds } from "@/backend/Services/skillsSync.service";
import {
  clean,
  dateKey,
  firstClause,
  formatMonth,
  isOngoing,
  lines,
  list,
  normalize,
  sentences,
  shortUrl,
  titleCase,
  yearOf,
  years,
} from "./text";

type Row = Record<string, unknown>;

export type CvLink = { label: string; href?: string };
export type CvEntry = {
  title: string;
  subtitle?: string;
  period?: string;
  place?: string;
  link?: CvLink;
  bullets: string[];
};
export type CvLine = { label: string; text: string };
export type CvSkillGroup = { label: string; items: string[] };

export type CvData = {
  nombre: string;
  titulo: string;
  contacto: CvLink[];
  resumen: string;
  experiencia: CvEntry[];
  destacados: CvEntry[];
  otrosProyectos: (CvLine & { link?: CvLink })[];
  skills: CvSkillGroup[];
  blandas: string[];
  competencias: CvLine[];
  educacion: CvLine[];
  idiomas: CvLine[];
};

const active = (row: Row) => row.estado !== false;

const PROJECT_WEIGHT: Record<string, number> = {
  web3: 4,
  fullstack: 4,
  backend: 4,
  mobile: 3,
  desktop: 3,
  otro: 2,
  frontenddemo: 1,
  frontend: 1,
};

const SKILL_GROUP: Record<string, string> = {
  backenddevelopment: "Backend",
  frontenddevelopment: "Frontend",
  databasemanagement: "Bases de datos",
  devops: "DevOps",
  web3: "Web3 & IA",
  herramientas: "Herramientas",
};
const SKILL_GROUP_ORDER = ["Lenguajes", "Backend", "Bases de datos", "Frontend", "Web3 & IA", "DevOps", "Herramientas"];

const LANGUAGES = new Set([
  "typescript", "javascript", "python", "rust", "php", "java", "c", "c++", "c#",
  "go", "golang", "kotlin", "swift", "ruby", "sql", "plpgsql", "solidity", "dart", "shell", "bash",
]);

const SKILL_NAMES: Record<string, string> = {
  reactjs: "React",
  nextjs: "Next.js",
  expressjs: "Express",
  nodejs: "Node.js",
  djangorestframework: "Django REST Framework",
  sqlserver: "SQL Server",
  mongobd: "MongoDB",
  mongodb: "MongoDB",
  git: "Git",
  plpgsql: "PL/pgSQL",
  html5: "HTML",
  css3: "CSS",
  aiagents: "Agentes de IA",
  tailwindcss: "Tailwind CSS",
};

// Topics that GitHub sync imports as skills but are domains, not technologies.
const NOT_SKILLS = new Set(["tourism", "travel", "hackathon", "portfolio"]);

const AI_SKILL = /agente|agent|\bia\b|\bai\b|llm|mcp|x402/i;

const splitTitle = (titulo: string) => {
  const [title, ...rest] = titulo.split(/\s+[-–—]\s+/);
  return { title: title.trim(), subtitle: rest.join(" – ").trim() || undefined };
};

const linkFor = (row: Row): CvLink | undefined => {
  const href = clean(row.urlDemo) || clean(row.urlGithub);
  return href ? { label: shortUrl(href), href } : undefined;
};

const periodSort = (periodo: unknown) => {
  const ys = years(periodo);
  const end = isOngoing(periodo) ? 9999 : ys.length ? Math.max(...ys) : 0;
  return end * 10000 + (ys[0] ?? 0);
};

function buildExperience(rows: Row[]) {
  const groups = new Map<string, Row[]>();
  for (const row of rows.filter(active)) {
    const key = normalize(clean(row.empresa));
    if (!key) continue;
    groups.set(key, [...(groups.get(key) ?? []), row]);
  }

  return [...groups.values()]
    .map((items) => {
      items.sort((a, b) => dateKey(b.fecha_fin) - dateKey(a.fecha_fin));
      const latest = items[0];
      const start = items.reduce((min, r) => (dateKey(r.fecha_inicio) < dateKey(min.fecha_inicio) ? r : min));
      const ongoing = items.some((r) => !clean(r.fecha_fin));
      const period =
        items.length > 1
          ? `${yearOf(start.fecha_inicio) ?? ""} – ${ongoing ? "Actualidad" : yearOf(latest.fecha_fin) ?? ""}`
          : `${formatMonth(start.fecha_inicio)} – ${ongoing ? "Actualidad" : formatMonth(latest.fecha_fin)}`;
      const ubicacion = clean(latest.ubicacion);
      const place = /jujuy/i.test(ubicacion)
        ? "Jujuy, Argentina"
        : ubicacion.split(",").slice(-2).join(",").trim() || undefined;
      const bullets = [...new Set(items.slice().reverse().flatMap((r) => lines(r.logros)))];
      return {
        sortKey: ongoing ? Number.MAX_SAFE_INTEGER : dateKey(latest.fecha_fin),
        entry: {
          title: titleCase(clean(latest.empresa)),
          subtitle: clean(latest.cargo) || undefined,
          period,
          place,
          bullets,
        } satisfies CvEntry,
      };
    })
    .sort((a, b) => b.sortKey - a.sortKey)
    .map((g) => g.entry);
}

function buildProjects(rows: Row[], empresas: string[], maxOthers: number, maxBullets: number) {
  const empresaKeys = empresas.map(normalize).filter((k) => k.length > 6);
  const candidates = rows
    .filter(active)
    .filter((row) => clean(row.descripcion) && clean(row.titulo))
    .map((row) => {
      const key = normalize(clean(row.titulo));
      const institutional = empresaKeys.some((e) => key.includes(e));
      const score =
        (PROJECT_WEIGHT[normalize(clean(row.categoria))] ?? 2) * 10 +
        (clean(row.rol) ? 3 : 0) +
        (linkFor(row) ? 2 : 0) +
        periodSort(row.periodo) / 1e7;
      return { row, institutional, score };
    })
    .filter((p) => !p.institutional || p.row.destacado === true)
    .sort((a, b) => b.score - a.score);

  const flagged = candidates.filter((p) => p.row.destacado === true);
  const featured = (flagged.length ? flagged : candidates.slice(0, 2))
    .sort((a, b) => periodSort(b.row.periodo) - periodSort(a.row.periodo));
  const rest = candidates.filter((p) => !featured.includes(p)).slice(0, maxOthers);

  const destacados: CvEntry[] = featured.map(({ row }) => {
    const { title, subtitle } = splitTitle(clean(row.titulo));
    return {
      title,
      subtitle,
      period: clean(row.periodo) || undefined,
      place: clean(row.rol) || undefined,
      link: linkFor(row),
      bullets: sentences(row.descripcion).slice(0, maxBullets),
    };
  });

  const otrosProyectos = rest.map(({ row }) => {
    const { title } = splitTitle(clean(row.titulo));
    const tags = (Array.isArray(row.tags) ? row.tags : list(row.tags))
      .map((t) => clean(t))
      .filter((t, i, all) => t && all.findIndex((o) => normalize(o) === normalize(t)) === i)
      .slice(0, 4);
    const text = sentences(row.descripcion)[0] ?? "";
    return {
      label: title,
      text: tags.length ? `${text.replace(/\.$/, "")} (${tags.join(", ")}).` : text,
      link: linkFor(row),
    };
  });

  return { destacados, otrosProyectos };
}

function buildSkills(rows: Row[], excluded: Set<number>, perGroup: number) {
  const seen = new Set<string>();
  const groups = new Map<string, { name: string; valor: number }[]>();
  const sorted = rows
    .filter(active)
    .filter((r) => !excluded.has(Number(r.id)))
    .sort((a, b) => Number(b.valor ?? 0) - Number(a.valor ?? 0));

  for (const row of sorted) {
    const raw = clean(row.nombre);
    const key = normalize(raw);
    if (!key || NOT_SKILLS.has(key)) continue;
    const name = SKILL_NAMES[key] ?? raw;
    const dedupe = normalize(name);
    if (seen.has(dedupe)) continue;
    seen.add(dedupe);

    let group = SKILL_GROUP[normalize(clean(row.tipo))] ?? (clean(row.tipo) || "Herramientas");
    if (LANGUAGES.has(key)) group = "Lenguajes";
    else if (group === "Herramientas" && AI_SKILL.test(name)) group = "Web3 & IA";
    groups.set(group, [...(groups.get(group) ?? []), { name, valor: Number(row.valor ?? 0) }]);
  }

  const rank = (label: string) => {
    const i = SKILL_GROUP_ORDER.indexOf(label);
    return i === -1 ? SKILL_GROUP_ORDER.length : i;
  };
  return [...groups.entries()]
    .sort(([a], [b]) => rank(a) - rank(b))
    .map(([label, items]) => ({ label, items: items.slice(0, perGroup).map((i) => i.name) }));
}

function buildCompetencias(rows: Row[], includeOther: boolean) {
  const buckets: Record<string, { text: string; key: number }[]> = {
    "Programación competitiva": [],
    Hackatones: [],
    Eventos: [],
  };
  for (const row of rows.filter(active)) {
    const titulo = clean(row.titulo);
    if (!titulo) continue;
    const haystack = `${titulo} ${clean(row.organizador)} ${clean(row.tipo)}`;
    const bucket = /hackat/i.test(haystack)
      ? "Hackatones"
      : /icpc|torneo|tap\b|universal cup|training camp|competitiva|olimp/i.test(haystack)
        ? "Programación competitiva"
        : "Eventos";

    const [name, detail] = titulo.split(/\s+[—–]\s+/);
    const highlight = sentences(row.descripcion)
      .map(firstClause)
      .find((s) => /puesto|lugar|ganador|finalista|premio|medalla|menci[oó]n/i.test(s));
    let text = bucket === "Hackatones" ? name.replace(/^hackat(h)?[oó]n\s+/i, "") : name;
    if (highlight) text += `: ${highlight.replace(/\.$/, "")}`;
    const year = /\b(19|20)\d{2}\b/.test(text) ? undefined : years(row.periodo)[0];
    const extra = [
      bucket === "Hackatones" && detail ? detail.charAt(0).toUpperCase() + detail.slice(1) : "",
      highlight ? "" : year ?? "",
    ].filter(Boolean);
    if (extra.length) text += ` (${extra.join(", ")})`;
    buckets[bucket].push({ text, key: (highlight ? 1e5 : 0) + periodSort(row.periodo) / 1e4 });
  }
  return Object.entries(buckets)
    .filter(([label, items]) => items.length && (includeOther || label !== "Eventos"))
    .map(([label, items]) => ({
      label,
      text: items.sort((a, b) => b.key - a.key).map((i) => i.text).join(" · ") + ".",
    }));
}

function buildEducacion(rows: Row[]) {
  const visible = rows.filter(active);
  const carreras = visible
    .filter((r) => clean(r.tipo) !== "Curso")
    .sort((a, b) => periodSort(b.periodo) - periodSort(a.periodo))
    .map((r) => {
      const periodo = clean(r.periodo);
      const ys = years(periodo);
      const when = isOngoing(periodo)
        ? `En curso${ys[0] ? ` (desde ${ys[0]})` : ""}`
        : ys.length
          ? String(Math.max(...ys))
          : periodo;
      return { label: clean(r.titulo), text: [clean(r.institucion), when].filter(Boolean).join(" — ") };
    });
  const cursos = visible
    .filter((r) => clean(r.tipo) === "Curso")
    .sort((a, b) => periodSort(a.periodo) - periodSort(b.periodo))
    .map((r) => {
      const name = clean(r.titulo).replace(/^diplomatura (universitaria )?(en |de )?/i, "");
      const meta = [clean(r.institucion), years(r.periodo)[0]].filter(Boolean).join(", ");
      return meta ? `${name} (${meta})` : name;
    });
  const hasDiplomas = visible.some((r) => /diplomatura/i.test(clean(r.titulo)));
  return [
    ...carreras,
    ...(cursos.length
      ? [{ label: hasDiplomas ? "Diplomaturas y cursos" : "Cursos", text: cursos.join(" · ") + "." }]
      : []),
  ];
}

function buildContacto(rows: Row[], telefono: string, ubicacion: string | undefined, siteUrl: string) {
  const ordered = rows
    .filter(active)
    .sort((a, b) => Number(a.orden ?? 999) - Number(b.orden ?? 999));
  const find = (re: RegExp) =>
    ordered.find((r) => re.test(`${clean(r.icono)} ${clean(r.nombre)}`));

  const email = find(/mail/i);
  const phone = find(/phone|tel[eé]fono/i) ?? find(/whatsapp/i);
  const linkedin = find(/linkedin/i);
  const github = find(/github/i);

  const contacto: CvLink[] = [];
  if (ubicacion) contacto.push({ label: ubicacion });
  const phoneText = clean(phone?.titulo) || telefono;
  if (phoneText) contacto.push({ label: phoneText, href: clean(phone?.link) || undefined });
  if (email) contacto.push({ label: clean(email.titulo), href: clean(email.link) || undefined });
  if (linkedin) contacto.push({ label: "LinkedIn", href: clean(linkedin.link) });
  if (github) contacto.push({ label: "GitHub", href: clean(github.link) });
  if (siteUrl) contacto.push({ label: "Portfolio", href: siteUrl });
  return contacto;
}

export type CvDensity = {
  maxOthers: number;
  maxBullets: number;
  skillsPerGroup: number;
  includeEvents: boolean;
};

export type CvSource = Awaited<ReturnType<typeof loadCvSource>>;

export async function loadCvSource() {
  const [perfil, experience, project, skills, academia, eventos, contacto, excluded] =
    await Promise.all([
      repository.getAllDataRepository("perfil"),
      repository.getAllDataRepository("experience"),
      repository.getAllDataRepository("project"),
      repository.getAllDataRepository("skills"),
      repository.getAllDataRepository("academia"),
      repository.getAllDataRepository("eventos"),
      repository.getAllDataRepository("contacto"),
      getExcludedSkillIds(),
    ]);
  return { perfil: perfil[0] ?? {}, experience, project, skills, academia, eventos, contacto, excluded };
}

export function buildCv(source: CvSource, density: CvDensity, siteUrl: string): CvData {
  const { perfil } = source;
  const experiencia = buildExperience(source.experience);
  const latestPlace = source.experience
    .filter(active)
    .sort((a, b) => dateKey(b.fecha_fin) - dateKey(a.fecha_fin))
    .map((r) => clean(r.ubicacion))
    .find(Boolean);
  const ubicacion = latestPlace
    ? /san salvador de jujuy/i.test(latestPlace)
      ? "San Salvador de Jujuy, Argentina"
      : latestPlace.split(",").slice(-2).join(",").trim()
    : undefined;

  const { destacados, otrosProyectos } = buildProjects(
    source.project,
    source.experience.map((r) => clean(r.empresa)),
    density.maxOthers,
    density.maxBullets
  );

  return {
    nombre: clean(perfil.nombre),
    titulo: clean(perfil.cvTitulo) || clean(perfil.rol),
    contacto: buildContacto(source.contacto, clean(perfil.telefono), ubicacion, siteUrl),
    resumen: clean(perfil.cvResumen) || clean(perfil.resumen),
    experiencia: experiencia.map((e) => ({ ...e, bullets: e.bullets.slice(0, density.maxBullets) })),
    destacados,
    otrosProyectos,
    skills: buildSkills(source.skills, source.excluded, density.skillsPerGroup),
    blandas: list(perfil.habilidadesBlandas),
    competencias: buildCompetencias(source.eventos, density.includeEvents),
    educacion: buildEducacion(source.academia),
    idiomas: lines(perfil.idiomas).map((line) => {
      const [label, ...rest] = line.split(":");
      return { label: label.trim(), text: rest.join(":").trim() };
    }),
  };
}
