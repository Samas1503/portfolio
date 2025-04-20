// utils/response.ts
import { NextResponse } from "next/server";

export function safeJson(data: unknown) {
  return NextResponse.json(
    JSON.parse(
      JSON.stringify(data, (_, value) =>
        typeof value === "bigint" ? value.toString() : value
      )
    )
  );
}
