export { THEME_STORAGE_KEY } from "./storage";

/** Use in SVG / Recharts where raw `var(--token)` is required */
export function cssVar(name: string): string {
  return `var(${name.startsWith("--") ? name : `--${name}`})`;
}
