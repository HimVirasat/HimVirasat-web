type TokenProvider = () => Promise<string | null>;

let authTokenProvider: TokenProvider | null = null;

export function setAuthTokenProvider(provider: TokenProvider | null) {
  authTokenProvider = provider;
}

export async function getAuthToken() {
  return authTokenProvider?.() ?? null;
}

export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
) {
  const token = await getAuthToken();
  const headers = new Headers(init.headers);

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
