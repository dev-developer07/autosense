import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const loginSchema = z.object({
  adminId: z.string().min(1).max(120),
  password: z.string().min(1).max(200),
});

export const adminLoginFn = createServerFn({ method: "POST" })
  .inputValidator((data) => loginSchema.parse(data))
  .handler(async ({ data }) => {
    const { authenticateAdmin } = await import("./admin.server");
    const session = await authenticateAdmin(data.adminId, data.password);
    if (!session) return { ok: false as const, error: "Invalid admin credentials. Please try again." };
    return { ok: true as const, token: session.token, adminId: session.adminId, role: session.role };
  });

export const verifyAdminSessionFn = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ token: z.string().max(2000) }).parse(data))
  .handler(async ({ data }) => {
    const { verifyAdminToken } = await import("./admin.server");
    return { valid: await verifyAdminToken(data.token) };
  });
