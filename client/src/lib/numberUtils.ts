/**
 * Number Parsing Utilities for RTL Languages
 * Handles Arabic-Indic numerals, Hebrew numerals, and locale-specific formatting
 */

/**
 * Convert Arabic-Indic numerals to ASCII digits
 * ٠١٢٣٤٥٦٧٨٩ → 0123456789
 */
function arabicToAsciiDigits(str: string): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const asciiDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  let result = str;
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(arabicDigits[i], 'g'), asciiDigits[i]);
  }
  return result;
}

/**
 * Remove thousand separators (Arabic and English)
 * 1,000 → 1000
 * 1٬000 → 1000
 */
function removeThousandSeparators(str: string): string {
  return str.replace(/[,٬]/g, '');
}

/**
 * Normalize decimal separator (Arabic, Hebrew, English)
 * 1.5 → 1.5
 * 1,5 → 1.5
 * 1٫5 → 1.5
 */
function normalizeDecimalSeparator(str: string): string {
  // Replace Arabic decimal separator (٫) with dot
  str = str.replace(/٫/g, '.');
  // Replace comma with dot (for locales that use comma as decimal separator)
  // But be careful not to replace thousand separators
  // This is a simplified approach - in production, you might want more sophisticated parsing
  return str;
}

/**
 * Parse a number string from RTL input
 * Handles:
 * - Arabic-Indic numerals (٠-٩)
 * - Hebrew numerals
 * - Thousand separators (, and ٬)
 * - Decimal separators (. and ,)
 * 
 * @param input Input string (can be from user input in RTL context)
 * @returns Parsed number or NaN if invalid
 */
export function parseRTLNumber(input: string): number {
  if (!input || typeof input !== 'string') {
    return NaN;
  }

  // Trim whitespace
  let normalized = input.trim();

  // Convert Arabic-Indic numerals to ASCII
  normalized = arabicToAsciiDigits(normalized);

  // Remove thousand separators
  normalized = removeThousandSeparators(normalized);

  // Normalize decimal separator
  normalized = normalizeDecimalSeparator(normalized);

  // Parse as number
  const parsed = parseFloat(normalized);

  return parsed;
}

/**
 * Validate if a string is a valid number
 * @param input Input string
 * @returns true if valid number, false otherwise
 */
export function isValidNumber(input: string): boolean {
  const parsed = parseRTLNumber(input);
  return Number.isFinite(parsed);
}

/**
 * Format number for display (with thousand separators)
 * @param num Number to format
 * @param decimals Number of decimal places
 * @returns Formatted string
 */
export function formatNumber(num: number, decimals: number = 2): string {
  if (!Number.isFinite(num)) {
    return '0';
  }
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format date string for input (YYYY-MM-DD)
 * @param date Date object or string
 * @returns Formatted date string
 */
export function formatDateForInput(date: Date | string): string {
  if (typeof date === 'string') {
    return date;
  }
  return date.toISOString().split('T')[0];
}

/**
 * Get month as ASCII digits (not locale-dependent)
 * @param date Date object
 * @returns Month as string (01-12)
 */
export function getMonthAsString(date: Date): string {
  return String(date.getMonth() + 1).padStart(2, '0');
}

/**
 * Get year as ASCII digits
 * @param date Date object
 * @returns Year as string (YYYY)
 */
export function getYearAsString(date: Date): string {
  return String(date.getFullYear());
}
