import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { decrypt } from "@/app/lib/session";

const GITHUB_API = "https://api.github.com";

const TECH_KEYWORDS = [
  "next.js", "react", "typescript", "javascript", "tailwind", "supabase",
  "postgres", "mysql", "python", "django", "flask", "fastapi", "node",
  "express", "docker", "vite", "prisma", "graphql", "redis", "mongodb",
];

const ROLE_BY_CATEGORY: Record<string, string> = {
  Frontend: "Frontend Developer",
  "Frontend Demo": "Frontend Developer",
  Backend: "Backend Developer",
  Fullstack: "Fullstack Developer",
  Web3: "Blockchain Developer",
  Mobile: "Mobile Developer",
  Desktop: "Desktop Developer",
};

const titleCase = (s: string) =>
  s.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).trim();

function firstParagraph(md: string): string {
  for (const raw of md.split("\n")) {
    const line = raw.trim();
    if (
      !line ||
      line.startsWith("#") ||
      line.startsWith("![") ||
      line.startsWith("[!") ||
      line.startsWith("<") ||
      line.startsWith("|") ||
      line.startsWith("```")
    )
      continue;
    return line.replace(/\[(.*?)\]\(.*?\)/g, "$1").replace(/[`*_]/g, "");
  }
  return "";
}

function inferCategoria(topics: string[], language: string | null): string {
  const hay = [...topics, language ?? ""].join(" ").toLowerCase();
  const frontend = /react|next|vue|angular|svelte|tailwind|css|html|frontend|web/.test(hay);
  const backend = /api|backend|express|django|flask|fastapi|nest|server|database|sql|supabase/.test(hay);
  const mobile = /android|ios|flutter|react-native|kotlin|swift|mobile/.test(hay);
  const web3 = /web3|blockchain|solidity|ethereum|crypto/.test(hay);
  const desktop = /electron|tauri|desktop|tkinter|qt/.test(hay);
  if (web3) return "Web3";
  if (mobile) return "Mobile";
  if (desktop) return "Desktop";
  if (frontend && backend) return "Fullstack";
  if (frontend) return "Frontend";
  if (backend) return "Backend";
  return "Otro";
}

export async function GET(req: Request) {
  const cookie = (await cookies()).get("session")?.value;
  const session = cookie ? await decrypt(cookie) : null;
  if (!session?.userId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const url = new URL(req.url).searchParams.get("url") ?? "";
  const match = url.match(/github\.com[/:]([^/]+)\/([^/?#.]+)/);
  if (!match) {
    return NextResponse.json(
      { error: "URL de GitHub inválida" },
      { status: 400 }
    );
  }
  const [, owner, repoName] = match;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const repoRes = await fetch(`${GITHUB_API}/repos/${owner}/${repoName}`, {
      headers,
      next: { revalidate: 300 },
    });
    if (!repoRes.ok) {
      return NextResponse.json(
        { error: `GitHub respondió ${repoRes.status}` },
        { status: 502 }
      );
    }
    const repo = await repoRes.json();

    let readme = "";
    try {
      const readmeRes = await fetch(
        `${GITHUB_API}/repos/${owner}/${repoName}/readme`,
        {
          headers: { ...headers, Accept: "application/vnd.github.raw" },
          next: { revalidate: 300 },
        }
      );
      if (readmeRes.ok) readme = await readmeRes.text();
    } catch {
      // README opcional
    }

    const topics: string[] = Array.isArray(repo.topics) ? repo.topics : [];
    const readmeHay = readme.slice(0, 4000).toLowerCase();
    const extraTechs = TECH_KEYWORDS.filter(
      (t) =>
        readmeHay.includes(t) &&
        !topics.some((tp) => tp.toLowerCase() === t) &&
        repo.language?.toLowerCase() !== t
    );
    const tags = [
      ...(repo.language ? [repo.language] : []),
      ...topics.map(titleCase),
      ...extraTechs.map(titleCase),
    ]
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .join(", ");

    const startYear = repo.created_at
      ? new Date(repo.created_at).getFullYear()
      : null;
    const endYear = repo.pushed_at
      ? new Date(repo.pushed_at).getFullYear()
      : startYear;
    const periodo = startYear
      ? startYear === endYear
        ? `${startYear}`
        : `${startYear} - ${endYear}`
      : undefined;

    const categoria = inferCategoria(topics, repo.language);

    return NextResponse.json({
      titulo: titleCase(String(repo.name ?? "")),
      descripcion: repo.description || firstParagraph(readme),
      categoria,
      rol: ROLE_BY_CATEGORY[categoria] ?? "Developer",
      periodo,
      tags,
    });
  } catch (error) {
    console.log("Error en /api/repo-fill:", error);
    return NextResponse.json(
      { error: "No se pudo leer el repositorio" },
      { status: 500 }
    );
  }
}
