type ApiParams<T> = {
  resource: string;
  id?: number | string;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  data?: T;
};

function getBase() {
  return "http://localhost:3000";
}

export async function apiFetch<T = unknown, R = unknown>({
  resource,
  id,
  method = "GET",
  data,
}: ApiParams<T>): Promise<R> {
  const base = getBase();
  let url = `${base}/api/table`;
  if (id != null) {
    url += `/${encodeURIComponent(String(id))}`;
  }
  url += `?tipo=${encodeURIComponent(resource)}`;

  const isFormData = typeof FormData !== "undefined" && data instanceof FormData;

  const opts: RequestInit = {
    method,
    headers: isFormData ? undefined : { "Content-Type": "application/json" },
    body:
      method !== "GET" && data != null
        ? isFormData
          ? (data as BodyInit)
          : JSON.stringify(data)
        : undefined,
  };

  const res = await fetch(url, opts);

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errorText}`);
  }

  return (await res.json()) as R;
}
