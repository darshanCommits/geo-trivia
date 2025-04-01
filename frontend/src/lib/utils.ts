import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function gameOverMsg(score: number): string {
	if (score >= 80) return "Excellent work!";
	if (score >= 50) return "Well done!";

	return "Good effort!";
}

/**
 * Calculates current progress percentage
 */
export const calculateProgress = (curr: number, total: number): number => {
	return Math.round((curr / total) * 100);
};
