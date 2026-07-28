const enabledDomains = new Set(
  (process.env.NEXT_PUBLIC_NEST_DOMAINS ?? "")
    .split(",")
    .map((domain) => domain.trim().toLowerCase())
    .filter(Boolean),
);

export function isNestDomainEnabled(domain: string): boolean {
  return enabledDomains.has("*") || enabledDomains.has(domain.toLowerCase());
}
