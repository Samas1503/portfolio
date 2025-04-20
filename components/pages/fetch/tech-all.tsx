type ApiParams<T> = {
  resource: string;
  id?: number | string;
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  data?: T;
};

function getBase () {return "http://localhost:3000"};

export async function apiFetch<T = unknown, R = unknown>({
  resource,
  id,
  method = "GET",
  data,
}: ApiParams<T>): Promise<R> {
  const base = getBase();
  // construyo la ruta dinámica y luego el query ?tipo=
  let url = `${base}/api/table`;
  if (id != null) {
    url += `/${encodeURIComponent(String(id))}`;
  }
  url += `?tipo=${encodeURIComponent(resource)}`;

  const opts: RequestInit = { method, headers: {} };
  if ((method === "POST" || method === "PATCH") && data != null) {
    opts.headers = { "Content-Type": "application/json" };
    opts.body = JSON.stringify(data);
  }

  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return (await res.json()) as R;
}
