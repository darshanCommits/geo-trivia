// Base message structure
export type BaseMessage = {
	id: string; // For request/response correlation
	timestamp: number;
};

// Core types
export type SocketError = {
	error: string;
};

export type User = {
	id?: string; // Server-generated, not present in initial requests
	username: string; // User-created on frontend
	sessionId: string; // References the game room
	score?: number; // Added when game starts
};

export type GameSession = {
	id: string;
	hostUsername: User["username"];
	players: User[];
	status: "waiting" | "active" | "finished";
	currentQuestion?: number;
	maxPlayers?: number;
};

export type Question = {
	id: string;
	text: string;
	options: string[];
	correctAnswer: number; // Index of correct option
	timeLimit: number; // Seconds
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

// Define your API endpoints with request/response pairs
//

export type WSSession = {
	// Session management
	"session:create": {
		request: { username: string }; // Only need username to create session
		response: { user: User; session: GameSession } | SocketError;
	};

	"session:join": {
		request: User; // Join existing session
		response: { user: User; session: GameSession } | SocketError;
	};

	"session:leave": {
		request: User; // Need to know which user is leaving
		response: { success: boolean } | SocketError;
	};
};

export type WSGameFlow = {
	// Game flow
	"game:start": {
		request: User; // Need to know who's trying to start the game
		response: { session: GameSession } | SocketError;
	};

	"game:answer": {
		request: { user: User; answer: Answer };
		response: { correct: boolean; points: number } | SocketError;
	};

	"game:skip": {
		request: User;
		response: { success: boolean } | SocketError;
	};
};

type WSServerEvents = {
	// Server-initiated events (no client request)
	"session:user-joined": {
		request: never;
		response: { user: User; session: GameSession };
	};

	"session:user-left": {
		request: never;
		response: { username: string; session: GameSession };
	};

	"game:question": {
		request: never;
		response: {
			question: Omit<Question, "correctAnswer">;
			questionNumber: number;
			totalQuestions: number;
		};
	};

	"game:question-end": {
		request: never;
		response: {
			correctAnswer: number;
			explanation?: string;
			leaderboard: Array<{ username: string; score: number }>;
		};
	};

	"game:finished": {
		request: never;
		response: { results: GameResult };
	};
};

export type WSEndpoints = WSSession & WSGameFlow & WSServerEvents;

// helper types
export type NotNever<T, K> = T extends never ? never : K;
export type OnlyNever<T, K> = [T] extends [never] ? K : never;

export type WSEvents = keyof WSEndpoints;
export type WSClientEvents = keyof WSClientEventHandlers;
export type WSRequest<T extends WSEvents> = WSEndpoints[T]["request"];
export type WSResponse<T extends WSEvents> = WSEndpoints[T]["response"];

export type WSServerOnlyEvents = {
	[K in WSEvents]: OnlyNever<WSRequest<K>, K>;
}[WSEvents];

// Extract request and response types
export type WSRequestMessage<T extends WSEvents> = BaseMessage & {
	type: T;
	data: WSRequest<T>;
};

// Union types for all possible messages. might be useful, might not be.
export type WSClientMessage = {
	[K in WSEvents]: NotNever<WSRequest<K>, WSRequestMessage<K>>;
}[WSEvents];

// Event handlers
export type WSClientEventHandlers = {
	[K in WSEvents as NotNever<WSRequest<K>, K>]: (
		data: WSRequest<K>,
		messageId: string,
	) => Promise<WSResponse<K>> | WSResponse<K>;
};

export type WSServerEventHandlers = {
	[K in WSEvents]: (data: WSResponse<K>) => void;
};

export type LogEntry<T extends WSEvents> =
	| { direction: "emit"; type: T; payload: WSRequest<T> }
	| { direction: "receive"; type: T; payload: WSResponse<T> };

// --- slop ---

// Step 1: Filter client->server event names
type ClientToServerEventNames = {
	[K in WSEvents]: NotNever<WSRequest<K>, K>;
}[WSEvents];

// Step 2: Filter server->client event names
type ServerToClientEventNames = {
	[K in WSEvents]: OnlyNever<WSRequest<K>, K>;
}[WSEvents];

// Step 3: Define event interfaces

export type ClientToServerEvents = {
	[E in ClientToServerEventNames]: (
		payload: WSRequest<E>,
		callback: (response: WSResponse<E>) => void,
	) => void;
};

export type ServerToClientEvents = {
	[E in ServerToClientEventNames]: (payload: WSResponse<E>) => void;
};
