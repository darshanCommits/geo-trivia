import type { Types } from "@shared/types";

export interface SessionState {
	sessionId: string | null;
	username: string | null;
	users: Types.User[];
	hostId: string | null;
	isHost: boolean;
	error: string | null;
	isLoading: boolean;
	joinedAt: Date | null;
}
