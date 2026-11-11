let cachedAppToken: { token: string; expiresAt: number } | null = null;
let cachedCreds: { clientId: string; clientSecret: string; refreshToken?: string } | null = null;

async function getReplitXToken(): Promise<string> {
  const token = process.env.REPL_IDENTITY
    ? "repl " + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? "depl " + process.env.WEB_REPL_RENEWAL
    : null;
  if (!token) throw new Error("X-Replit-Token not found");
  return token;
}

async function loadCredentials(): Promise<{ clientId: string; clientSecret: string; refreshToken?: string }> {
  if (cachedCreds) return cachedCreds;

  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = await getReplitXToken();
  const res = await fetch(
    `https://${hostname}/api/v2/connection?include_secrets=true&connector_names=spotify`,
    { headers: { Accept: "application/json", "X-Replit-Token": xReplitToken } }
  );
  const data = await res.json();
  const settings = data.items?.[0];
  if (!settings) throw new Error("Spotify not connected");

  const creds = settings.settings?.oauth?.credentials;
  const clientId: string = process.env.SPOTIFY_CLIENT_ID || creds?.client_id;
  const clientSecret: string = process.env.SPOTIFY_CLIENT_SECRET || creds?.client_secret;
  const refreshToken: string = creds?.refresh_token;

  if (!clientId || !clientSecret) throw new Error("Spotify credentials not found");

  cachedCreds = { clientId, clientSecret, refreshToken };
  return cachedCreds;
}

async function getClientCredentialsToken(): Promise<string> {
  if (cachedAppToken && cachedAppToken.expiresAt > Date.now() + 30_000) {
    return cachedAppToken.token;
  }
  const { clientId, clientSecret } = await loadCredentials();
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Client credentials failed (${res.status}): ${text}`);
  }
  const json = await res.json();
  cachedAppToken = { token: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return cachedAppToken.token;
}

export async function spotifySearch(
  query: string,
  types: string[] = ["track"],
  limit = 3
): Promise<any> {
  const token = await getClientCredentialsToken();
  const params = new URLSearchParams({ q: query, type: types.join(","), limit: String(limit) });
  const res = await fetch(`https://api.spotify.com/v1/search?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Spotify search failed (${res.status}): ${text}`);
  }
  return res.json();
}
