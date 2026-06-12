const TOKEN_COST_PER_1K_USD: Record<"local" | "online", number> = {
  local: 0,
  online: 0.002
};

export function estimateRoutingCost(input: {
  provider: "local" | "online";
  estimatedTokens: number;
}): number {
  const rate = TOKEN_COST_PER_1K_USD[input.provider];
  return Number(((input.estimatedTokens / 1000) * rate).toFixed(4));
}

export function estimateTokenCost(input: {
  provider: string;
  tokens: number;
}): number {
  const provider = input.provider === "ollama" || input.provider === "local" ? "local" : "online";
  return estimateRoutingCost({ provider, estimatedTokens: input.tokens });
}
