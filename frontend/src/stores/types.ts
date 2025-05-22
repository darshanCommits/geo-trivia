import type { Types } from "@shared/types";

export type SessionState = {
	sessionId: string | null;
	username: string | null;
	users: Types.User[];
	hostId: string | null;
	isHost: boolean;
	error: string | null;
	isLoading: boolean;
	joinedAt: Date | null;
	status: string;
};

export type SessionStore = {
	setState: (partial: Partial<SessionState>) => void;
	setSessionId: (id: string | null) => void;
	setUsername: (username: string | null) => void;
	setHostId: (hostId: string | null) => void;
	setIsHost: (isHost: boolean) => void;
	setJoinedAt: (date: Date | null) => void;
	setStatus: (status: string) => void;

	setUsers: (users: Types.User[]) => void;
	addUser: (user: Types.User) => void;
	removeUser: (userId: string) => void;
	updateUserScore: (username: string, score: number) => void;

	setError: (error: string | null) => void;
	setLoading: (loading: boolean) => void;

	resetSession: () => void;

	syncScoresToGameStore: () => void;
} & SessionState;

export type SocketState =
	| "disconnected"
	| "connecting"
	| "connected"
	| "reconnecting";

export interface SocketStore {
	isConnected: boolean;
	socketState: SocketState;
	lastError: Error | null;
	reconnectAttempt: number;

	setState: (partial: Partial<SocketStore>) => void;
	setConnected: (connected: boolean) => void;
	setSocketState: (state: SocketState) => void;
	setLastError: (error: Error | null) => void;
	setReconnectAttempt: (attempt: number) => void;

	incrementReconnectAttempt: () => void;
	resetReconnectAttempt: () => void;
}

export type GameState = {
	currentQuestion: Types.QuestionType | null;
	currentQuestionIndex: number;
	totalQuestions: number;
	timer: number | null;
	answerResult: {
		username: string;
		isAnswerCorrect: boolean;
		answer: number;
	} | null;
	currentScores: Types.Score[];
	finalScores: Types.Score[];
	isGameOver: boolean;
	isGameStarted: boolean;
	isLoading: boolean;
	error: string | null;
	hasSubmittedAnswer: boolean;

	// cached first place username for optimization
	topPlayerUsername: string | null;
};

export type GameStore = GameState & {
	setCurrentScores: (scores: Types.Score[]) => void;
	setGameStarted: (started: boolean) => void;
	setGameOver: (finalScores: Types.Score[]) => void;
	setCurrentQuestion: (
		question: Types.QuestionType,
		index: number,
		total: number,
	) => void;
	setTimer: (timer: number | null) => void;
	setAnswerResult: (
		username: string,
		isAnswerCorrect: boolean,
		answer: number,
	) => void;
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
	setHasSubmittedAnswer: (submitted: boolean) => void;
	resetGame: () => void;

	hasAnswered: (username: string) => boolean;
	getCurrentPlayerScore: (username: string) => number;
	isPlayerInFirstPlace: (username: string) => boolean;

	setState: (partial: Partial<GameState>) => void;
};
