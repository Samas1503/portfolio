export function serializeData<T>(data: T): T | null {
  if (data === undefined || data === null) return null;

  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}
