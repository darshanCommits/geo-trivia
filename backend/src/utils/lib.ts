import type { User } from "@shared/types";

export const generateSessionId = () => {
	return `session_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
};

export const generateUserId = () => {
	return `user_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
};

export const createUser = (username: string, sessionId = "") => {
	const user: User = {
		id: generateUserId(),
		username: username,
		sessionId: sessionId || generateSessionId(),
	};

	return user;
};
