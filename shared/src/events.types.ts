import type {
	Answer,
	GameSession,
	Leaderboard,
	Question,
	User,
} from "./core.types";

// ============================================================================
// WEBSOCKET MESSAGE STRUCTURE
// ============================================================================

export type WSMessage<T extends string, D = unknown> = {
	id: string;
	type: T;
	timestamp: number;
	data: D;
};

export type WSError = {
	error: string;
};

// ============================================================================
// EVENT DEFINITIONS
// ============================================================================

// Client-to-Server Events
export type ClientEvents = {
	// Session Management
	"session:create": {
		request: { username: string };
		response: { user: User; session: GameSession };
	};

	"session:join": {
		request: { username: string; sessionId: string };
		response: { user: User; session: GameSession };
	};

	"session:leave": {
		request: { username: string; sessionId: string };
		response: { username: string; sessionId: string };
	};

	// Game Flow
	"game:start": {
		request: { username: string };
		response: { session: GameSession }; // it will send active status
	};

	"game:answer": {
		request: { username: string; answer: Answer };
		response: { correct: boolean; user: User }; // client gets back full User object with updated score
	};

	"game:skip": {
		request: { username: string }; // we dont need to send the full user state
		response: { success: boolean };
	};
};

export type GameErrorEvents = {
	"game:start-failed": {
		reason:
			| "insufficient_players"
			| "game_already_started"
			| "not_host"
			| "session_not_found";
		message: string;
	};
	"game:answer-failed": {
		reason:
			| "no_active_question"
			| "already_answered"
			| "invalid_answer"
			| "user_not_found";
		message: string;
	};
	"game:skip-failed": {
		reason: "no_active_question" | "not_authorized" | "user_not_found";
		message: string;
	};
};

type SessionErrorEvents = {
	"session:create-failed": {
		reason: "session_exists" | "invalid_username" | "server_error";
		message: string;
	};
	"session:join-failed": {
		reason:
			| "session_not_found"
			| "username_taken"
			| "session_full"
			| "invalid_session";
		message: string;
		sessionId?: string;
	};
	"session:leave-failed": {
		reason: "user_not_found" | "session_not_found";
		message: string;
	};
};

type SessionEvents = SessionErrorEvents & {
	"session:user-joined": User;

	"session:user-left": { username: string; sessionId: string };

	"session:deleted": {
		sessionId: string;
		reason: string;
	};
};

export type ServerEvents = GameEvents &
	SessionEvents & {
		error: WSError;
	};

// Server-to-Client Events (broadcasts)
export type GameEvents = GameErrorEvents & {
	"game:question": {
		question: Omit<Question, "correctAnswer">;
		questionNumber: number;
		totalQuestions: number;
	};

	"game:question-end": {
		correctAnswer: number;
		explanation?: string;
		leaderboard: Leaderboard;
	};

	"game:finished": Leaderboard;
};
