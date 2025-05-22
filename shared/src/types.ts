// --- Event Constants ---
export namespace Events {
	export const CREATE_SESSION = "create_session";
	export const JOIN_SESSION = "join_session";
	export const LEAVE_SESSION = "leave_session";
	export const DISCONNECT = "disconnect";
	export const SUBMIT_ANSWER = "submit_answer";

	export const SESSION_CREATED = "session_created";
	export const SESSION_EXISTS = "session_exists";
	export const USERNAME_TAKEN = "username_taken";
	export const USER_JOINED = "user_joined";
	export const USER_LEFT = "user_left";
	export const ANSWER_RESULT = "answer_result";
	export const GAME_OVER = "game_over";
	export const SESSION_CLOSED = "session_closed";
	export const QUESTION_PROMPT = "question_prompt";
	export const START_GAME = "start_game";
}

// --- Data Types ---
export namespace Types {
	export interface SessionState {
		sessionId: string | null;
		username: string | null;
		users: Types.User[];
		hostId: string | null;
		isHost: boolean;
		error: string | null;
		isLoading: boolean;
		joinedAt: Date | null;
		questions: QuestionType[];
	}

	export type QuestionType = {
		question: string;
		options: string[];
		correctAnswer: number;
		timeout: number;
		region: string;
	};

	export type User = {
		id: string;
	} & Score;

	export type Score = {
		username: string;
		score: number;
	};
	export type ServerSessionData = {
		hostId: string;
		users: { id: string; username: string; score: number }[];
		questions: Types.QuestionType[];
		currentQuestionIndex: number;
		answered: boolean;
	};
	export type Sessions = Map<string, ServerSessionData>;
}

// --- Socket.IO Event Interfaces ---

export interface ClientToServerEvents {
	[Events.CREATE_SESSION]: (data: {
		sessionId: string;
		username: string;
	}) => void;
	[Events.JOIN_SESSION]: (data: {
		sessionId: string;
		username: string;
	}) => void;
	[Events.START_GAME]: (data: { sessionId: string }) => void;
	[Events.LEAVE_SESSION]: () => void;
	[Events.DISCONNECT]: () => void;
	[Events.SUBMIT_ANSWER]: (data: {
		sessionId: string;
		username: string;
		answer: number;
	}) => void;
}

// Events from server to client
export interface ServerToClientEvents {
	[Events.SESSION_CREATED]: (data: {
		sessionId: string;
		username: string;
	}) => void;
	[Events.SESSION_EXISTS]: () => void;
	[Events.USERNAME_TAKEN]: () => void;
	[Events.USER_JOINED]: (data: { id: string; username: string }) => void;
	[Events.USER_LEFT]: (data: { userId: string }) => void;
	[Events.QUESTION_PROMPT]: (data: {
		question: Types.QuestionType;
		index: number;
		total: number;
	}) => void;
	[Events.ANSWER_RESULT]: (data: {
		username: string;
		isAnswerCorrect: boolean;
		answer: number;
		scores: Types.Score[];
	}) => void;
	[Events.GAME_OVER]: (data: { finalScores: Types.Score[] }) => void;
	[Events.SESSION_CLOSED]: () => void;
}
