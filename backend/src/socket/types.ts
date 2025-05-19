export interface ClientToServerEvents {
	create_session: (data: { sessionId: string; username: string }) => void;
	join_session: (data: { sessionId: string; username: string }) => void;
	leave_session: () => void;
	disconnect: () => void;
}

export interface ServerToClientEvents {
	session_created: (data: { sessionId: string; username: string }) => void;
	session_exists: () => void;
	session_not_found: () => void;
	username_taken: () => void;
	user_joined: (data: { username: string }) => void;
	user_left: (data: { userId: string }) => void;
	session_closed: () => void;
}

export type SocketData = {
	sessionId?: string; // Track user's session on the socket
	username?: string;
};

export type SessionData = {
	hostId: string;
	users: { id: string; username: string }[];
};
