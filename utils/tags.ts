export const parseTags = (value: unknown): string[] => {
  const list = Array.isArray(value) ? value : String(value ?? "").split(",");
  return Array.from(
    new Set(list.map((tag) => String(tag).trim()).filter(Boolean))
  );
};
