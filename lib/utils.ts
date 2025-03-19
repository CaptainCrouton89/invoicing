import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

/**
 * Format a phone number to (xxx) xxx-xxxx format
 * Handles different input formats and cleans up non-numeric characters
 */
export function formatPhoneNumber(phoneNumber: string | undefined): string {
  if (!phoneNumber) return "—";

  // Strip all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, "");

  // Check if we have a valid 10-digit US phone number
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
    // Handle numbers with country code 1
    return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  // Return original if not matching expected format
  return phoneNumber;
}

/**
 * Calculate the number of days overdue from a due date
 * Returns a positive number for overdue invoices (days overdue)
 * Returns a negative number for upcoming invoices (days until due)
 * Returns 0 if the due date is today
 */
export function calculateDueStatus(dueDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to beginning of day

  const dueDate = new Date(dueDateStr);
  dueDate.setHours(0, 0, 0, 0); // Reset time for fair comparison

  // Calculate the difference in milliseconds
  const diffMs = today.getTime() - dueDate.getTime();

  // Convert to days (positive for overdue, negative for upcoming)
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  return diffDays;
}
