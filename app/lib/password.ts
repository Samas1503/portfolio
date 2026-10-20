import "server-only";
import { createHash } from "crypto";

// SHA256 con SESSION_SECRET como salt/pepper del servidor.
export function hashPassword(password: string) {
  return createHash("sha256")
    .update(password + (process.env.SESSION_SECRET ?? ""))
    .digest("hex");
}
