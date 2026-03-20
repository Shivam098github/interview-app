import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const DOMAINS = [
  "DSA",
  "System Design",
  "Behavioral",
  "Frontend",
  "Backend",
  "DevOps",
  "Machine Learning",
  "Database",
  "Mobile",
] as const;

export const EXPERIENCE_LEVELS = [
  { value: "fresher", label: "Fresher (0-1 yr)" },
  { value: "junior", label: "Junior (1-3 yrs)" },
  { value: "mid", label: "Mid (3-6 yrs)" },
  { value: "senior", label: "Senior (6+ yrs)" },
] as const;

export const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function getCompleteness(fields: (string | null | undefined)[]) {
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

export function parseJsonArray(str: string | null | undefined): string[] {
  if (!str) return [];
  try {
    return JSON.parse(str);
  } catch {
    return [];
  }
}
