import { ApiError, requestJson, requestVoid, resolveApiUrl } from './http-client';

interface BackendRegisterResponse {
  id: number | string;
  username: string;
  email: string;
  enabled: boolean;
  createdAt: string;
}

interface BackendLoginResponse {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
}

export interface AuthUserSummary {
  id: string;
  username: string;
  email: string;
  enabled: boolean;
  createdAt: string;
}

export interface RegisterInput {
  username: string;
  email: string;
  password: string;
}

export type RegisterResult = AuthUserSummary;

export interface SignInInput {
  usernameOrEmail: string;
  password: string;
}

export interface SignInResult {
  tokenType: string;
  accessToken: string;
  expiresIn: number;
  user?: AuthUserSummary;
}

export type RequestVerificationResult = void;
export type RequestPasswordResetResult = void;

export interface VerifyEmailResult {
  ok: boolean;
  code?: string;
}

interface VerifyEmailInput {
  token: string;
}

interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

interface ChangeOwnPasswordInput {
  currentPassword: string;
  newPassword: string;
}

function normalizeUser(input: {
  id: number | string;
  username: string;
  email: string;
  enabled: boolean;
  createdAt: string;
}): AuthUserSummary {
  return {
    id: String(input.id),
    username: input.username,
    email: input.email,
    enabled: input.enabled,
    createdAt: input.createdAt,
  };
}

function tryExtractCode(payload: unknown, fallback: string): string {
  if (typeof payload === 'object' && payload !== null && 'code' in payload) {
    const code = (payload as { code?: unknown }).code;
    if (typeof code === 'string' && code.trim().length > 0) {
      return code;
    }
  }

  return fallback;
}

async function verifyEmailAgainstBackend(token: string): Promise<VerifyEmailResult> {
  try {
    const response = await fetch(resolveApiUrl(`/auth/verify-email?token=${encodeURIComponent(token)}`), {
      method: 'GET',
      redirect: 'manual',
      credentials: 'include',
    });

    if (response.type === 'opaqueredirect') {
      return { ok: true };
    }

    if (response.status >= 300 && response.status < 400) {
      return { ok: true };
    }

    if (response.ok) {
      return { ok: true };
    }

    const payload = await response.json().catch(() => null);
    return {
      ok: false,
      code: tryExtractCode(payload, `HTTP_${response.status}`),
    };
  } catch {
    return { ok: false, code: 'NETWORK_ERROR' };
  }
}

export const authApi = {
  async register(input: RegisterInput): Promise<RegisterResult> {
    const response = await requestJson<BackendRegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });

    return normalizeUser(response);
  },

  async signIn(input: SignInInput): Promise<SignInResult> {
    const response = await requestJson<BackendLoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });

    return response;
  },

  async requestEmailVerification(email: string): Promise<RequestVerificationResult> {
    await requestVoid('/auth/verify-email/request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async verifyEmail(input: VerifyEmailInput): Promise<VerifyEmailResult> {
    const token = input.token.trim();

    if (!token) {
      return { ok: false, code: 'INVALID_TOKEN' };
    }

    return verifyEmailAgainstBackend(token);
  },

  async requestPasswordReset(email: string): Promise<RequestPasswordResetResult> {
    await requestVoid('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    await requestVoid('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  async changeOwnPassword(accessToken: string, input: ChangeOwnPasswordInput): Promise<void> {
    await requestVoid('/auth/users/me/password', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(input),
    });
  },

  async logoutAll(accessToken?: string): Promise<void> {
    if (!accessToken) {
      return;
    }

    try {
      await requestVoid('/auth/logout-all', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        return;
      }
      throw error;
    }
  },
};
