/** Industry / field-of-work options for candidate applications. */
export const WORK_FIELDS = [
  "Information Technology",
  "Software Engineering",
  "Finance & Accounting",
  "Banking & Insurance",
  "Healthcare & Medical",
  "Education & Training",
  "Engineering & Manufacturing",
  "Sales & Business Development",
  "Marketing & Communications",
  "Human Resources",
  "Administration & Office Support",
  "Customer Service",
  "Hospitality & Tourism",
  "Retail",
  "Logistics & Supply Chain",
  "Construction & Trades",
  "Legal",
  "Media & Creative",
  "Government & Public Sector",
  "Science & Research",
  "Other",
] as const;

export type WorkField = (typeof WORK_FIELDS)[number] | string;

/** Light phone validation: digits, spaces, +, -, (), 7–20 digit chars. */
export function isValidPhoneNumber(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) return false;
  return /^[+]?[\d\s().-]{7,20}$/.test(trimmed);
}

export function normalizePhoneNumber(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}
