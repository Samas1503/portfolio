const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const LOWER_WORDS = new Set(["de", "del", "la", "las", "el", "los", "y", "e", "en", "a"]);

// The built-in PDF fonts only cover WinAnsi; anything else (emojis, arrows) is dropped.
const WIN_ANSI_EXTRA = "–—‘’‚“”„†‡•…‰‹›€™ŠšŽžŒœŸƒˆ˜";
export const sanitize = (value: string) =>
  Array.from(value)
    .filter((ch) => ch.charCodeAt(0) <= 0xff || WIN_ANSI_EXTRA.includes(ch))
    .join("")
    .replace(/[ \t]+/g, " ")
    .trim();

export const clean = (value: unknown) =>
  typeof value === "string" ? sanitize(value) : "";

export const normalize = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9+#]/g, "");

export const lines = (value: unknown) =>
  clean(value)
    ? String(value)
        .split(/\r?\n/)
        .map((line) => sanitize(line.replace(/^\s*[-•*]\s*/, "")))
        .filter(Boolean)
    : [];

export const list = (value: unknown) =>
  clean(value)
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

export const sentences = (value: unknown) =>
  clean(value)
    .split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ¿¡])/)
    .map((s) => s.trim())
    .filter(Boolean);

export const titleCase = (value: string) => {
  if (value !== value.toUpperCase()) return value;
  return value
    .toLowerCase()
    .split(" ")
    .map((word, i) =>
      i > 0 && LOWER_WORDS.has(word) ? word : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
};

export const years = (value: unknown) =>
  (clean(value).match(/\b(19|20)\d{2}\b/g) ?? []).map(Number);

export const isOngoing = (value: unknown) => /actual|curso|presente/i.test(clean(value));

const parseDate = (value: unknown) => {
  const match = clean(value).match(/^(\d{4})-(\d{2})/);
  return match ? { year: Number(match[1]), month: Number(match[2]) } : null;
};

export const dateKey = (value: unknown) => {
  const date = parseDate(value);
  return date ? date.year * 12 + date.month : Number.MAX_SAFE_INTEGER;
};

export const formatMonth = (value: unknown) => {
  const date = parseDate(value);
  return date ? `${MONTHS[date.month - 1]} ${date.year}` : "Actualidad";
};

export const yearOf = (value: unknown) => parseDate(value)?.year;

export const shortUrl = (url: string) =>
  url.replace(/^https?:\/\/(www\.)?/, "").replace(/\.git$/, "").replace(/\/$/, "");

export const firstClause = (value: string) => value.split(/\s+[—–]\s+|;\s+/)[0].trim();
