/**
 * Binary prefixed file size, e.g. `"42MiB"`.
 *
 * @see https://en.wikipedia.org/wiki/Binary_prefix
 */
export type BinaryPrefixedSize = `${number}${"" | "Ki" | "Mi" | "Gi" | "Ti" | "Pi"}B`;

const BINARY_PREFIX_FACTORS: Record<string, number> = {
  "": 1,
  Ki: 1024,
  Mi: 1024 ** 2,
  Gi: 1024 ** 3,
  Ti: 1024 ** 4,
  Pi: 1024 ** 5,
};

const DECIMAL_UNITS = ["B", "KB", "MB", "GB", "TB", "PB"] as const;

/**
 * Converts a file size to bytes. Numbers are passed through, binary prefixed strings
 * (e.g. `"42MiB"`) are expanded (42 * 1024 * 1024).
 */
export function parseFileSize(size: number | BinaryPrefixedSize): number {
  if (typeof size === "number") return size;

  const match = /^(\d+(?:\.\d+)?)\s*(Ki|Mi|Gi|Ti|Pi)?B$/.exec(size.trim());
  if (!match) return Number.NaN;

  return Number(match[1]) * BINARY_PREFIX_FACTORS[match[2] ?? ""];
}

/**
 * Formats a file size for display. Sizes are shown in decimal notation (e.g. 44 MB for
 * 42MiB) because users are mostly non-technical and decimal units are simpler to read.
 */
export function formatFileSize(size: number | BinaryPrefixedSize, locale?: string): string {
  const bytes = parseFileSize(size);
  if (Number.isNaN(bytes)) return "";

  let value = Math.abs(bytes);
  let unitIndex = 0;
  while (value >= 1000 && unitIndex < DECIMAL_UNITS.length - 1) {
    value /= 1000;
    unitIndex += 1;
  }

  const formatted = new Intl.NumberFormat(locale, {
    maximumFractionDigits: unitIndex === 0 ? 0 : 1,
  }).format(bytes < 0 ? -value : value);

  return `${formatted} ${DECIMAL_UNITS[unitIndex]}`;
}
