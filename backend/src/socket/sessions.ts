import type { SessionData } from "./types";

export const sessions = new Map<string, SessionData>();

export function cleanupSession(sessionId: string) {
	sessions.delete(sessionId);
}
