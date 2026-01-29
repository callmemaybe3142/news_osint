import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Format large numbers with commas
 */
export function formatNumber(num: number): string {
    return new Intl.NumberFormat("en-US").format(num);
}

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(d);
}

/**
 * Format week date (used for aggregated data)
 */
export function formatWeek(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    }).format(d);
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(
    current: number,
    previous: number
): number {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
}
