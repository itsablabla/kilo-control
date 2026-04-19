import "server-only";

const KILO_BASE = process.env.KILO_API_BASE || "https://api.kilo.ai";

function token() {
  const t = process.env.KILO_API_TOKEN;
  if (!t) throw new Error("KILO_API_TOKEN is not set");
  return t;
}

type TrpcSuccess<T> = [{ result: { data: T } }];
type TrpcError = [{ error: { message: string; data?: { httpStatus?: number } } }];
type TrpcResponse<T> = TrpcSuccess<T> | TrpcError;

function isError<T>(r: TrpcResponse<T>): r is TrpcError {
  return "error" in r[0];
}

async function trpcQuery<T>(path: string, input: unknown = {}): Promise<T> {
  const url = `${KILO_BASE}/api/trpc/${path}?batch=1&input=${encodeURIComponent(
    JSON.stringify({ 0: input })
  )}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token()}` },
    cache: "no-store",
  });
  const body = (await res.json()) as TrpcResponse<T>;
  if (isError(body)) {
    throw new Error(`[${path}] ${body[0].error.message}`);
  }
  return body[0].result.data;
}

async function trpcMutation<T>(path: string, input: unknown = {}): Promise<T> {
  const res = await fetch(`${KILO_BASE}/api/trpc/${path}?batch=1`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token()}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({ 0: input }),
    cache: "no-store",
  });
  const body = (await res.json()) as TrpcResponse<T>;
  if (isError(body)) {
    throw new Error(`[${path}] ${body[0].error.message}`);
  }
  return body[0].result.data;
}

// --- Types ---
export type AgentProfile = {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
  varCount: number;
  commandCount: number;
};

export type AgentProfileDetail = AgentProfile & {
  variables: Array<{ id: string; key: string; value: string | null; isSecret: boolean }>;
  commands: Array<{ id: string; command: string; order: number }>;
};

export type KiloUser = {
  id: string;
  google_user_email: string;
  google_user_name: string;
  google_user_image_url: string | null;
  microdollars_used: number;
  total_microdollars_acquired: number;
  kilo_pass_threshold: number;
  stripe_customer_id: string | null;
  is_admin: boolean;
  next_credit_expiration_at?: string | null;
  hosted_domain?: string;
};

export type KiloClawStatus = {
  userId: string;
  sandboxId: string | null;
  orgId: string | null;
  provider: string;
  runtimeId: string | null;
  storageId: string | null;
  region: string | null;
  status: string;
  provisionedAt: number | null;
  lastStartedAt: number | null;
  lastStoppedAt: number | null;
  envVarCount: number;
  secretCount: number;
  channelCount: number;
  flyAppName: string | null;
  flyMachineId: string | null;
  flyVolumeId: string | null;
  flyRegion: string | null;
};

export type Model = {
  id: string;
  name: string;
  supportsVision: boolean;
  isPreferred: boolean;
};

export type ByokProvider = {
  id: string;
  provider_id: string;
  provider_name: string;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
};

export type ActiveSession = {
  id: string;
  createdAt?: string;
  status?: string;
  [k: string]: unknown;
};

// --- API ---
export const kilo = {
  user: () =>
    fetch(`${KILO_BASE}/api/user`, {
      headers: { Authorization: `Bearer ${token()}` },
      cache: "no-store",
    }).then((r) => r.json() as Promise<KiloUser>),

  profiles: {
    list: () => trpcQuery<AgentProfile[]>("agentProfiles.list", {}),
    get: (profileId: string) => trpcQuery<AgentProfileDetail>("agentProfiles.get", { profileId }),
    create: (input: { name: string; description?: string }) =>
      trpcMutation<AgentProfile>("agentProfiles.create", input),
    update: (input: { profileId: string; name?: string; description?: string }) =>
      trpcMutation<AgentProfile>("agentProfiles.update", input),
    delete: (profileId: string) =>
      trpcMutation<{ success: boolean }>("agentProfiles.delete", { profileId }),
    setCommands: (profileId: string, commands: string[]) =>
      trpcMutation<{ success: boolean }>("agentProfiles.setCommands", { profileId, commands }),
    setAsDefault: (profileId: string) =>
      trpcMutation<{ success: boolean }>("agentProfiles.setAsDefault", { profileId }),
  },

  sessions: {
    list: () =>
      trpcQuery<{ sessions: ActiveSession[] }>("activeSessions.list", {}).then((d) => d.sessions),
  },

  kiloclaw: {
    status: () => trpcQuery<KiloClawStatus>("kiloclaw.getStatus", {}),
  },

  models: {
    list: () => trpcQuery<Model[]>("models.list", {}),
  },

  byok: {
    list: () => trpcQuery<ByokProvider[]>("byok.list", {}),
  },

  organizations: {
    list: () => trpcQuery<Array<{ id: string; name: string }>>("organizations.list", {}),
  },

  gateway: {
    chat: async (input: {
      model: string;
      messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
      stream?: boolean;
    }) => {
      const res = await fetch(`${KILO_BASE}/api/gateway/v1/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token()}`,
          "content-type": "application/json",
        },
        body: JSON.stringify(input),
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error(`Gateway ${res.status}: ${await res.text()}`);
      }
      return res;
    },
  },
};
