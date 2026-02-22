import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '../../api/auth-api';

export interface ActiveCustomer {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  accessToken: string;
}

interface RegisterInput {
  username: string;
  emailAddress: string;
  password: string;
}

interface SignInInput {
  usernameOrEmail: string;
  password: string;
}

interface VerifyEmailResult {
  ok: boolean;
  code?: string;
}

interface AuthContextValue {
  activeCustomer: ActiveCustomer | null;
  pendingEmailAddress: string;
  signIn: (input: SignInInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  requestEmailVerification: (emailAddress: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<VerifyEmailResult>;
  requestPasswordReset: (emailAddress: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  changeOwnPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  signOut: () => void;
}

interface AuthFlowState {
  pendingEmailAddress: string;
}

interface JwtPayload {
  uid?: string | number;
  sub?: string;
}

const CUSTOMER_STORAGE_KEY = 'site_active_customer_v2';
const FLOW_STORAGE_KEY = 'site_auth_flow_v1';
const KNOWN_IDENTITIES_STORAGE_KEY = 'site_known_identities_v1';

const INITIAL_FLOW_STATE: AuthFlowState = {
  pendingEmailAddress: '',
};

const AuthContext = createContext<AuthContextValue | null>(null);

function parseJson<T>(rawValue: string | null): T | null {
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as T;
  } catch {
    return null;
  }
}

function isEmail(value: string): boolean {
  return value.includes('@');
}

function toTitleCase(value: string): string {
  if (!value) {
    return '';
  }

  return value[0].toUpperCase() + value.slice(1);
}

function deriveDisplayNames(username: string, emailAddress: string): { firstName: string; lastName: string } {
  const source = username.trim() || emailAddress.split('@')[0] || 'Invitado';
  const normalized = source.replace(/[._-]+/g, ' ').trim();
  const chunks = normalized.split(' ').filter(Boolean);

  if (chunks.length === 0) {
    return { firstName: 'Invitado', lastName: '' };
  }

  const firstName = toTitleCase(chunks[0]);
  return { firstName, lastName: '' };
}

function decodeBase64Url(value: string): string {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  return atob(padded);
}

function parseJwtPayload(token: string): JwtPayload | null {
  const parts = token.split('.');
  if (parts.length < 2) {
    return null;
  }

  try {
    const payloadText = decodeBase64Url(parts[1]);
    const payload = JSON.parse(payloadText) as JwtPayload;
    return payload;
  } catch {
    return null;
  }
}

function deriveUsernameFromIdentity(identity: string): string {
  if (isEmail(identity)) {
    return identity.split('@')[0] || 'usuario';
  }
  return identity || 'usuario';
}

function normalizeEmail(emailAddress: string): string {
  return emailAddress.trim().toLowerCase();
}

function readKnownIdentities(): Record<string, string> {
  return parseJson<Record<string, string>>(window.localStorage.getItem(KNOWN_IDENTITIES_STORAGE_KEY)) ?? {};
}

function writeKnownIdentities(value: Record<string, string>): void {
  window.localStorage.setItem(KNOWN_IDENTITIES_STORAGE_KEY, JSON.stringify(value));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [activeCustomer, setActiveCustomer] = useState<ActiveCustomer | null>(null);
  const [flowState, setFlowState] = useState<AuthFlowState>(INITIAL_FLOW_STATE);

  useEffect(() => {
    const storedCustomer = parseJson<ActiveCustomer>(window.localStorage.getItem(CUSTOMER_STORAGE_KEY));
    const storedFlowState = parseJson<AuthFlowState>(window.localStorage.getItem(FLOW_STORAGE_KEY));

    if (storedCustomer) {
      setActiveCustomer(storedCustomer);
    }

    if (storedFlowState) {
      setFlowState({
        pendingEmailAddress: storedFlowState.pendingEmailAddress ?? '',
      });
    }
  }, []);

  const persistCustomer = (customer: ActiveCustomer | null) => {
    if (!customer) {
      window.localStorage.removeItem(CUSTOMER_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customer));
  };

  const updateFlowState = (patch: Partial<AuthFlowState>) => {
    setFlowState((previous) => {
      const nextFlowState = {
        ...previous,
        ...patch,
      };
      window.localStorage.setItem(FLOW_STORAGE_KEY, JSON.stringify(nextFlowState));
      return nextFlowState;
    });
  };

  const rememberIdentity = (username: string, emailAddress: string) => {
    const normalizedUsername = username.trim();
    const normalizedEmailAddress = normalizeEmail(emailAddress);

    if (!normalizedUsername || !normalizedEmailAddress) {
      return;
    }

    const nextMap = {
      ...readKnownIdentities(),
      [normalizedUsername]: normalizedEmailAddress,
    };

    writeKnownIdentities(nextMap);
  };

  const resolveEmailAddress = (inputIdentity: string, username: string): string => {
    if (isEmail(inputIdentity)) {
      return normalizeEmail(inputIdentity);
    }

    const knownEmail = readKnownIdentities()[username];
    if (knownEmail) {
      return knownEmail;
    }

    return `${username}@usuario.local`;
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      activeCustomer,
      pendingEmailAddress: flowState.pendingEmailAddress,
      async signIn(input: SignInInput) {
        const identity = input.usernameOrEmail.trim();
        const result = await authApi.signIn({
          usernameOrEmail: identity,
          password: input.password,
        });
        const payload = parseJwtPayload(result.accessToken);

        const username =
          result.user?.username ??
          (typeof payload?.sub === 'string' && payload.sub.trim().length > 0 ? payload.sub : deriveUsernameFromIdentity(identity));

        const emailAddress = result.user?.email ?? resolveEmailAddress(identity, username);
        const derivedNames = deriveDisplayNames(username, emailAddress);
        const nextCustomer: ActiveCustomer = {
          id:
            result.user?.id ??
            (typeof payload?.uid === 'string' || typeof payload?.uid === 'number'
              ? String(payload.uid)
              : `customer-${username}`),
          username,
          firstName: derivedNames.firstName,
          lastName: derivedNames.lastName,
          emailAddress,
          accessToken: result.accessToken,
        };

        setActiveCustomer(nextCustomer);
        persistCustomer(nextCustomer);
        rememberIdentity(username, emailAddress);
        updateFlowState({ pendingEmailAddress: emailAddress });
      },
      async register(input: RegisterInput) {
        const response = await authApi.register({
          username: input.username.trim(),
          email: normalizeEmail(input.emailAddress),
          password: input.password,
        });

        rememberIdentity(response.username, response.email);

        updateFlowState({
          pendingEmailAddress: response.email,
        });
      },
      async requestEmailVerification(emailAddress: string) {
        const normalizedEmailAddress = normalizeEmail(emailAddress);
        await authApi.requestEmailVerification(normalizedEmailAddress);

        updateFlowState({
          pendingEmailAddress: normalizedEmailAddress,
        });
      },
      async verifyEmail(token: string) {
        return authApi.verifyEmail({ token });
      },
      async requestPasswordReset(emailAddress: string) {
        const normalizedEmailAddress = normalizeEmail(emailAddress);
        await authApi.requestPasswordReset(normalizedEmailAddress);

        updateFlowState({
          pendingEmailAddress: normalizedEmailAddress,
        });
      },
      async resetPassword(token: string, newPassword: string) {
        await authApi.resetPassword({
          token: token.trim(),
          newPassword,
        });
      },
      async changeOwnPassword(currentPassword: string, newPassword: string) {
        const accessToken = activeCustomer?.accessToken;

        if (!accessToken) {
          throw new Error('Debes iniciar sesion para cambiar tu contrasena.');
        }

        await authApi.changeOwnPassword(accessToken, {
          currentPassword,
          newPassword,
        });
      },
      signOut() {
        const accessToken = activeCustomer?.accessToken;
        setActiveCustomer(null);
        persistCustomer(null);

        void authApi.logoutAll(accessToken);
      },
    }),
    [activeCustomer, flowState],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
