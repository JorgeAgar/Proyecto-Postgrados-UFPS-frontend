export type UserRole = "funcionario" | "aspirante";

export interface MockSession {
  userRole: UserRole;
  displayName: string;
  email?: string;
  cedula?: string;
  loginAt: string;
}

export const MOCK_SESSION_STORAGE_KEY = "ufps_mock_session";

export function saveMockSession(session: MockSession) {
  localStorage.setItem(MOCK_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function readMockSession(): MockSession | null {
  const raw = localStorage.getItem(MOCK_SESSION_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as MockSession;

    if (!parsed?.userRole || !parsed?.displayName || !parsed?.loginAt) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function clearMockSession() {
  localStorage.removeItem(MOCK_SESSION_STORAGE_KEY);
}
