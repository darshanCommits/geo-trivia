import type {
	Answer,
	GameSession,
	Leaderboard,
	Question,
	User,
} from "./core.types";
import type { ClientEventName } from "./types";

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
	message?: string;
	reason?: string;
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
		request: { sessionId: string; region: string };
		response: { status: GameSession["status"]; totalQuestions: number }; // it will send active status
	};

	"game:question-next": {
		request: {
			sessionId: string;
		};
		response: {
			question: Omit<Question, "correctAnswer">;
			questionNumber: number;
			status: GameSession["status"];
		};
	};

	"game:answer": {
		request: { sessionId: string; username: string; answer: Answer };
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
			| "unable_to_fetch_question"
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

export type SessionErrorEvents = {
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
	};
	"session:leave-failed": {
		reason: "user_not_found" | "session_not_found";
		message: string;
	};
};

export type ServerErrorEvents = SessionErrorEvents & GameErrorEvents;

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
	"game:started": {
		sessionId: string;
		status: "active";
		totalQuestions: number;
		region: string;
		timestamp: string;
	};

	"game:question-recieved": {
		question: Omit<Question, "correctAnswer">;
		questionNumber: number;
	};

	"game:question-end": {
		correctAnswer: number;
		explanation?: string;
		leaderboard: Leaderboard;
	};

	"game:finished": { leaderboard: Leaderboard; status: GameSession["status"] };
};

type ErrorEventForClientEvent<K extends ClientEventName> =
	K extends `game:start`
		? GameErrorEvents["game:start-failed"]
		: K extends `game:answer`
			? GameErrorEvents["game:answer-failed"]
			: K extends `game:skip`
				? GameErrorEvents["game:skip-failed"]
				: K extends `session:create`
					? SessionErrorEvents["session:create-failed"]
					: K extends `session:join`
						? SessionErrorEvents["session:join-failed"]
						: K extends `session:leave`
							? SessionErrorEvents["session:leave-failed"]
							: never;

export type ClientSuccessResponse<K extends ClientEventName> = {
	success: true;
	data: ClientEvents[K]["response"];
};

export type ClientErrorResponse<K extends ClientEventName> = {
	success: false;
	error: ErrorEventForClientEvent<K> | WSError;
};

export type ClientResponseWithError<K extends ClientEventName> =
	| ClientSuccessResponse<K>
	| ClientErrorResponse<K>;
