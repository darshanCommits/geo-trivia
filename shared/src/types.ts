// ============================================================================
// CORE DOMAIN TYPES
// ============================================================================

export type User = {
	id?: string; // Server-generated
	username: string;
	sessionId: string;
	score?: number;
};

export type GameSession = {
	id: string;
	hostUsername: string;
	players: User[];
	status: "waiting" | "active" | "finished";
	currentQuestion?: number;
	maxPlayers?: number;
};

export type Question = {
	id: string;
	text: string;
	options: string[];
	correctAnswer: number;
	timeLimit: number;
};

export type Answer = {
	questionId: string;
	selectedOption: number;
	timeRemaining: number;
};

export type GameResult = {
	rankings: Array<{
		user: User;
		score: number;
		rank: number;
	}>;
	totalQuestions: number;
};

export type Leaderboard = Array<{
	username: string;
	score: number;
}>;

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
		request: User;
		response: { user: User; session: GameSession };
	};

	"session:leave": {
		request: User;
		response: User; // so that client can update its state
	};

	// Game Flow
	"game:start": {
		request: { username: string };
		response: { session: GameSession };
	};

	"game:answer": {
		request: { username: string; answer: Answer };
		response: { correct: boolean; points: number };
	};

	"game:skip": {
		request: { username: string };
		response: { success: boolean };
	};
};

// Server-to-Client Events (broadcasts)
type GameEvents = GameErrorEvents & {
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

	"game:finished": {
		results: GameResult;
	};
};

type GameErrorEvents = {
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

	"session:user-left": User;

	"session:deleted": {
		sessionId: string;
		reason: string;
	};
};

export type ServerEvents = GameEvents &
	SessionEvents & {
		error: WSError;
	};

// ============================================================================
// TYPE UTILITIES
// ============================================================================

export type ClientEventName = keyof ClientEvents;
export type ServerEventName = keyof ServerEvents;
export type EventName = ClientEventName | ServerEventName;

// Message types
export type ClientRequest<T extends ClientEventName> = WSMessage<
	T,
	ClientEvents[T]["request"]
>;
export type ClientResponse<T extends ClientEventName> =
	| ClientEvents[T]["response"]
	| WSError;
export type ServerBroadcast<T extends ServerEventName> = WSMessage<
	T,
	ServerEvents[T]
>;

// Handler types
export type ClientEventHandler<T extends ClientEventName> = (
	data: ClientEvents[T]["request"],
	messageId: string,
) => Promise<ClientResponse<T>> | ClientResponse<T>;

export type ServerEventHandler<T extends ServerEventName> = (
	data: ServerEvents[T],
) => void;

// Socket.IO compatible interfaces
export type ClientToServerEvents = {
	[K in ClientEventName]: (
		payload: ClientEvents[K]["request"],
		callback: (response: ClientResponse<K>) => void,
	) => void;
};

export type ServerToClientEvents = {
	[K in ServerEventName]: (payload: ServerEvents[K]) => void;
};

// Event handler maps
export type ClientEventHandlers = {
	[K in ClientEventName]: ClientEventHandler<K>;
};

export type ServerEventHandlers = {
	[K in ServerEventName]: ServerEventHandler<K>;
};

// ============================================================================
// LOGGING & DEBUGGING
// ============================================================================

export type LogEntry =
	| {
			direction: "send";
			event: ServerEventName;
			data: ServerEvents[ServerEventName];
			messageId: string;
	  }
	| {
			direction: "receive";
			event: ClientEventName;
			data: ClientEvents[ClientEventName]["request"];
			messageId: string;
	  }
	| {
			direction: "response";
			event: ClientEventName;
			data: ClientResponse<ClientEventName>;
			messageId: string;
	  };

export type ErrorReason = {
	[K in keyof ServerEvents]: K extends `${string}:${string}-failed`
		? ServerEvents[K] extends { reason: infer R }
			? R
			: never
		: never;
}[keyof ServerEvents];

export type SocketData = {
	user?: User;
	session?: GameSession;
};
