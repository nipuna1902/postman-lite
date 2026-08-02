export function substitute(text: string, variables: Record<string, string>): string {
  return text.replace(/\{\{(.*?)\}\}/g, (match, key) => {
    const trimmedKey = key.trim();
    return variables[trimmedKey] !== undefined ? variables[trimmedKey] : match;
  });
}
export function deepSubstitute(value: unknown, variables: Record<string, string>): unknown {
  if (typeof value === "string") return substitute(value, variables);
  if (Array.isArray(value)) return value.map((item) => deepSubstitute(item, variables));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, deepSubstitute(v, variables)])
    );
  }
  return value;
}