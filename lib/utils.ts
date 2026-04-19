import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCredits(microdollars: number) {
  return `$${(microdollars / 1_000_000).toFixed(2)}`;
}

export function formatDate(d: string | number | Date) {
  return new Date(d).toLocaleString();
}
