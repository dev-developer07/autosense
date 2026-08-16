// Browser-side admin session service. Swap the storage/token strategy here when
// moving to a real backend session/JWT — components only use these helpers.
import { adminLoginFn, verifyAdminSessionFn } from "./admin.functions";

const KEY = "autosense.admin.session";

export type AdminSession = { token: string; adminId: string };

export const authService = {
  async login(adminId: string, password: string) {
    const result = await adminLoginFn({ data: { adminId, password } });
    if (!result.ok) return { ok: false as const, error: result.error };
    const session: AdminSession = { token: result.token, adminId: result.adminId };
    if (typeof window !== "undefined") sessionStorage.setItem(KEY, JSON.stringify(session));
    return { ok: true as const, session };
  },

  read(): AdminSession | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as AdminSession) : null;
    } catch {
      return null;
    }
  },

  async verify(): Promise<AdminSession | null> {
    const session = this.read();
    if (!session) return null;
    const { valid } = await verifyAdminSessionFn({ data: { token: session.token } });
    if (!valid) {
      this.logout();
      return null;
    }
    return session;
  },

  logout() {
    if (typeof window !== "undefined") sessionStorage.removeItem(KEY);
  },
};
