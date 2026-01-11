export const API_BASE =
  (import.meta as any).env?.VITE_API_URL || "https://api.memecoinradar.online";

export type ApiToken = {
  symbol: string;
  name: string;
  chain: string;
  priceUsd: number;
  change24hPct: number;
};

export async function fetchTokens(): Promise<ApiToken[]> {
  const res = await fetch(`${API_BASE}/api/tokens`, {
    headers: { "Accept": "application/json" },
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  if (!data?.ok || !Array.isArray(data?.tokens)) return [];
  return data.tokens as ApiToken[];
}
