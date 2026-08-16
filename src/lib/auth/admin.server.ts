// Server-only admin authentication.
//
// Demo-grade only: credentials are compared server-side and can be moved to
// env vars (ADMIN_ID / ADMIN_PASSWORD / ADMIN_SESSION_SECRET) or a database
// with hashed passwords without touching the frontend contract.

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

function config() {
  return {
    // Hackathon fallbacks. Set the env vars to override in any real deployment.
    adminId: process.env["ADMIN_ID"] ?? "Circuit&Script",
    password: process.env["ADMIN_PASSWORD"] ?? "JIIT",
    secret: process.env["ADMIN_SESSION_SECRET"] ?? "autosense-demo-session-secret",
  };
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function b64url(input: string) {
  return btoa(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(payload: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return b64url(String.fromCharCode(...new Uint8Array(sig)));
}

export async function authenticateAdmin(adminId: string, password: string) {
  const cfg = config();
  const ok = timingSafeEqual(adminId, cfg.adminId) && timingSafeEqual(password, cfg.password);
  if (!ok) return null;
  const payload = b64url(JSON.stringify({ sub: "admin", exp: Date.now() + SESSION_TTL_MS }));
  const signature = await sign(payload, cfg.secret);
  return { token: `${payload}.${signature}`, adminId: cfg.adminId, role: "admin" as const };
}

export async function verifyAdminToken(token: string) {
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = await sign(payload, config().secret);
  if (!timingSafeEqual(signature, expected)) return false;
  try {
    const data = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as { exp: number };
    return data.exp > Date.now();
  } catch {
    return false;
  }
}
