/**
 * Serialise a value for embedding in <script type="application/ld+json">.
 * JSON.stringify alone is unsafe: store-owner text containing "</script>" would close the tag.
 * Escape "<" (and ">" / "&" for good measure) plus the U+2028/2029 line separators.
 */
export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(new RegExp("\\u2028", "g"), "\\u2028")
    .replace(new RegExp("\\u2029", "g"), "\\u2029");
}
