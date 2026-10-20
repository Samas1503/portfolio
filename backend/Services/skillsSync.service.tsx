import repository from "../repository";
import { getSupabase } from "@/backend/db/supabase";
import { parseTags } from "@/utils/tags";

type Row = Record<string, unknown>;

// Cada fuente se normaliza a su propio máximo; el código real de los repos
// pesa más que los tags declarados en los proyectos.
const LANG_WEIGHT = 0.6;
const TAG_WEIGHT = 0.4;

// Piso visual: cualquier skill con evidencia arranca ~35%.
const VALOR_MIN = 35;

const norm = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

// "react19" matchea "react": mismo prefijo y solo difiere en dígitos.
const matchesCandidate = (key: string, candidate: string) =>
  key === candidate ||
  (key.startsWith(candidate) && /^\d+$/.test(key.slice(candidate.length)));

const scoreCandidates = (
  candidates: Set<string>,
  counts: Map<string, number>
) => {
  let total = 0;
  for (const [key, count] of counts)
    for (const c of candidates)
      if (matchesCandidate(key, c)) {
        total += count;
        break;
      }
  return total;
};

// Aliases por skill (nombre normalizado) -> nombres vistos en lenguajes de
// GitHub o tags de proyectos.
const SKILL_ALIASES: Record<string, string[]> = {
  javascript: ["javascript"],
  typescript: ["typescript"],
  html5: ["html", "html5"],
  css3: ["css", "css3", "scss", "sass", "less"],
  python: ["python"],
  reactjs: ["react", "reactjs"],
  nextjs: ["nextjs", "next.js"],
  angular: ["angular"],
  django: ["django"],
  djangorestframework: [
    "djangorestframework",
    "django rest framework",
    "drf",
  ],
  laravel: ["laravel", "php", "blade"],
  expressjs: ["express", "expressjs", "express.js"],
  mysql: ["mysql"],
  postgresql: ["postgresql", "postgres"],
  sqlserver: ["sqlserver", "sql server", "mssql"],
  mongobd: ["mongodb", "mongo"],
  docker: ["docker", "dockerfile"],
  bootstrap: ["bootstrap"],
};

// Ruido típico de repos que no representa una habilidad.
const IGNORE_KEYS = new Set(
  [
    "procfile",
    "batchfile",
    "makefile",
    "cmake",
    "gitignore",
    "gitattributes",
    "editorconfig",
    "dockerignore",
    "npmrc",
    "eslintrc",
    "prettierrc",
    "json",
    "yaml",
    "yml",
    "toml",
    "xml",
    "csv",
    "mdx",
    "tex",
  ].map(norm)
);

// Nombre visible y categoría para las skills que se crean automáticamente.
const NEW_SKILL_CATALOG: Record<string, { nombre: string; tipo: string }> = {
  typescript: { nombre: "TypeScript", tipo: "Backend Development" },
  javascript: { nombre: "JavaScript", tipo: "Backend Development" },
  python: { nombre: "Python", tipo: "Backend Development" },
  php: { nombre: "PHP", tipo: "Backend Development" },
  rust: { nombre: "Rust", tipo: "Backend Development" },
  go: { nombre: "Go", tipo: "Backend Development" },
  java: { nombre: "Java", tipo: "Backend Development" },
  kotlin: { nombre: "Kotlin", tipo: "Backend Development" },
  nodejs: { nombre: "Node.js", tipo: "Backend Development" },
  express: { nombre: "Express.js", tipo: "Backend Development" },
  hono: { nombre: "Hono", tipo: "Backend Development" },
  html: { nombre: "HTML", tipo: "Frontend Development" },
  css: { nombre: "CSS", tipo: "Frontend Development" },
  scss: { nombre: "SCSS", tipo: "Frontend Development" },
  react: { nombre: "React", tipo: "Frontend Development" },
  nextjs: { nombre: "Next.js", tipo: "Frontend Development" },
  vite: { nombre: "Vite", tipo: "Frontend Development" },
  tailwind: { nombre: "Tailwind CSS", tipo: "Frontend Development" },
  sql: { nombre: "SQL", tipo: "Database Management" },
  sqlite: { nombre: "SQLite", tipo: "Database Management" },
  redis: { nombre: "Redis", tipo: "Database Management" },
  shell: { nombre: "Shell", tipo: "DevOps" },
  solana: { nombre: "Solana", tipo: "Web3" },
  anchor: { nombre: "Anchor", tipo: "Web3" },
  celo: { nombre: "Celo", tipo: "Web3" },
};

const DEFAULT_TIPO = "Herramientas";

const nivelFromValor = (valor: number) =>
  valor >= 75 ? "Experimentado" : valor >= 45 ? "Intermedio" : "Básico";

// Curva elevada: la skill con más peso llega a 100 y el resto nunca baja
// de VALOR_MIN mientras tenga evidencia.
const toValor = (weight: number, maxWeight: number) =>
  Math.min(
    100,
    Math.round(VALOR_MIN + (100 - VALOR_MIN) * Math.sqrt(weight / maxWeight))
  );

const parseRepoSlug = (url: unknown) => {
  const match = String(url ?? "").match(/github\.com\/([^/]+)\/([^/?#]+)/i);
  return match ? `${match[1]}/${match[2].replace(/\.git$/i, "")}` : null;
};

// Cache en memoria: evita refetchear todos los repos en cada recálculo.
const langCache = new Map<string, Record<string, number>>();

type RepoFetch = { langs: Record<string, number>; rateLimited: boolean };

const fetchRepoLanguages = async (slug: string): Promise<RepoFetch> => {
  const cached = langCache.get(slug);
  if (cached) return { langs: cached, rateLimited: false };
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
    };
    if (process.env.GITHUB_TOKEN)
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const res = await fetch(
      `https://api.github.com/repos/${slug}/languages`,
      { headers, signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) {
      console.log(`GitHub /languages ${slug} respondió ${res.status}`);
      return { langs: {}, rateLimited: res.status === 403 || res.status === 429 };
    }
    const langs = (await res.json()) as Record<string, number>;
    langCache.set(slug, langs);
    return { langs, rateLimited: false };
  } catch (error) {
    console.log(`No se pudieron obtener lenguajes de ${slug}:`, error);
    return { langs: {}, rateLimited: false };
  }
};

// La columna "excluida" vive fuera del schema genérico para que el sitio siga
// funcionando si la migración todavía no se aplicó.
export const getExcludedSkillIds = async (): Promise<Set<number>> => {
  try {
    const { data, error } = await getSupabase()
      .from("Skills")
      .select("id")
      .eq("excluida", true);
    if (error) throw error;
    return new Set((data ?? []).map((r) => Number(r.id)));
  } catch (error) {
    console.log("No se pudo leer Skills.excluida:", error);
    return new Set();
  }
};

export const setSkillExcluida = async (id: number, excluida: boolean) => {
  const { error } = await getSupabase()
    .from("Skills")
    .update({ excluida })
    .eq("id", id);
  if (error) throw error;
};

// Recalcula el valor/nivel de las skills a partir del uso real en los repos
// de los proyectos (bytes por lenguaje) y sus tags declarados. Las skills
// excluidas o sin evidencia conservan su valor; los lenguajes/tags detectados
// que no existen en la BD se crean solos.
export const syncSkillsFromProjects = async (options?: { force?: boolean }) => {
  try {
    if (options?.force) langCache.clear();

    const [projects, skills, excludedIds] = await Promise.all([
      repository.getAllDataRepository("project"),
      repository.getAllDataRepository("skills"),
      getExcludedSkillIds(),
    ]);
    if (!projects?.length || !skills?.length) return { updated: 0, added: [] };

    const slugs = [
      ...new Set(
        projects
          .map((p: Row) => parseRepoSlug(p.urlGithub))
          .filter((s): s is string => Boolean(s))
      ),
    ];
    const allLangs = await Promise.all(slugs.map(fetchRepoLanguages));

    // Si GitHub cortó por rate limit, los datos quedan parciales y la escala
    // relativa saldría distorsionada: mejor abortar que pisar valores sanos.
    if (allLangs.some((r) => r.rateLimited)) {
      console.log("skillsSync abortado: rate limit de GitHub alcanzado");
      return { updated: 0, added: [], aborted: "rate_limit" as const };
    }

    const langBytes = new Map<string, number>();
    const tagCount = new Map<string, number>();
    const displayName = new Map<string, string>();
    const remember = (key: string, raw: string) => {
      if (!displayName.has(key)) displayName.set(key, raw);
    };
    for (const { langs } of allLangs)
      for (const [lang, bytes] of Object.entries(langs)) {
        const key = norm(lang);
        langBytes.set(key, (langBytes.get(key) ?? 0) + bytes);
        remember(key, lang);
      }
    for (const p of projects)
      for (const tag of parseTags((p as Row).tags)) {
        const key = norm(tag);
        tagCount.set(key, (tagCount.get(key) ?? 0) + 1);
        remember(key, tag);
      }

    const maxLang = Math.max(...langBytes.values(), 0);
    const maxTag = Math.max(...tagCount.values(), 0);
    const weightOf = (key: string) =>
      (maxLang ? LANG_WEIGHT * ((langBytes.get(key) ?? 0) / maxLang) : 0) +
      (maxTag ? TAG_WEIGHT * ((tagCount.get(key) ?? 0) / maxTag) : 0);

    // Los aliases incluyen las keys del catálogo cuyo nombre visible coincide,
    // así una skill auto-creada (p. ej. "Tailwind CSS" desde el tag "tailwind")
    // no vuelve a generarse como nueva en el próximo sync.
    const catalogKeysFor = (normNombre: string) =>
      Object.entries(NEW_SKILL_CATALOG)
        .filter(([, v]) => norm(v.nombre) === normNombre)
        .map(([k]) => k);

    const candidatesOf = (nombre: string) =>
      new Set(
        [
          nombre,
          ...(SKILL_ALIASES[norm(nombre)] ?? []),
          ...catalogKeysFor(norm(nombre)),
        ].map(norm)
      );

    const skillCandidates = new Map<number, Set<string>>(
      (skills as Row[]).map((s) => [
        Number(s.id),
        candidatesOf(String(s.nombre ?? "")),
      ])
    );

    const covered = (key: string) =>
      [...skillCandidates.values()].some((cands) =>
        [...cands].some((c) => matchesCandidate(key, c))
      );

    // Lenguajes/tags detectados sin skill asociada -> se crean.
    const seen = new Set<string>();
    const newSkills: { key: string; nombre: string; tipo: string; weight: number }[] = [];
    for (const key of [...langBytes.keys(), ...tagCount.keys()]) {
      if (seen.has(key) || IGNORE_KEYS.has(key) || covered(key)) continue;
      seen.add(key);
      const weight = weightOf(key);
      if (weight <= 0) continue;
      const catalog = NEW_SKILL_CATALOG[key];
      newSkills.push({
        key,
        nombre: catalog?.nombre ?? displayName.get(key) ?? key,
        tipo: catalog?.tipo ?? DEFAULT_TIPO,
        weight,
      });
    }

    // Normalización relativa solo sobre lo que se va a actualizar/crear.
    const updatable = (skills as Row[]).filter(
      (s) => !excludedIds.has(Number(s.id))
    );
    const weights = new Map<number, number>(
      updatable.map((s) => [
        Number(s.id),
        (maxLang
          ? LANG_WEIGHT *
            (scoreCandidates(skillCandidates.get(Number(s.id))!, langBytes) /
              maxLang)
          : 0) +
          (maxTag
            ? TAG_WEIGHT *
              (scoreCandidates(skillCandidates.get(Number(s.id))!, tagCount) /
                maxTag)
            : 0),
      ])
    );

    const maxWeight = Math.max(
      ...[...weights.values()].filter((w) => w > 0),
      ...newSkills.map((s) => s.weight),
      0
    );
    if (!maxWeight) return { updated: 0, added: [] };

    let updated = 0;
    await Promise.all(
      updatable.map(async (skill) => {
        const weight = weights.get(Number(skill.id)) ?? 0;
        if (!weight) return; // sin evidencia: conserva el valor manual
        const valor = toValor(weight, maxWeight);
        const nivel = nivelFromValor(valor);
        if (skill.valor === valor && skill.nivel === nivel) return;
        await repository.updateDataRepository(
          Number(skill.id),
          { valor, nivel },
          "skills"
        );
        updated += 1;
      })
    );

    const added: string[] = [];
    await Promise.all(
      newSkills.map(async (s) => {
        const valor = toValor(s.weight, maxWeight);
        const id = await repository.postDataRepository(
          {
            tipo: s.tipo,
            nombre: s.nombre,
            nivel: nivelFromValor(valor),
            valor,
            estado: true,
          },
          "skills"
        );
        if (id != null) added.push(s.nombre);
      })
    );

    console.log(
      `skillsSync: ${updated} actualizadas, ${added.length} nuevas (${slugs.length} repos analizados)`
    );
    return { updated, added, excluded: excludedIds.size };
  } catch (error) {
    console.log("Error en syncSkillsFromProjects:", error);
    return { updated: 0, added: [] };
  }
};

const services = { syncSkillsFromProjects };

export default services;
