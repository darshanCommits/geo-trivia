// --- Event Constants ---
export namespace Events {
	export const CREATE_SESSION = "create_session";
	export const DISCONNECT = "disconnect";
	export const CONNECTED = "connected";

	export const JOIN_SESSION = "join_session";
	export const LEAVE_SESSION = "leave_session";
	export const SESSION_CREATED = "session_created";
	export const SESSION_CLOSED = "session_closed";
	export const SESSION_EXISTS = "session_exists";

	export const USERNAME_TAKEN = "username_taken";
	export const USER_JOINED = "user_joined";
	export const USER_LEFT = "user_left";
	export const ERROR = "error";

	export const ANSWER_RESULT = "answer_result";
	export const QUESTION_PROMPT = "question_prompt";
	export const START_GAME = "start_game";
	export const UPDATE_ANSWERS = "update_answers";
	export const SUBMIT_ANSWER = "submit_answer";
	export const GAME_OVER = "game_over";
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

	// export type User = {
	// 	id: string;
	// } & Score;

	export type Score = {
		username: string;
		score: number;
	};

	export type User = {
		sessionId: string;
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
	[Events.CREATE_SESSION]: (payload: Omit<Types.User, "score">) => void;
	[Events.JOIN_SESSION]: (payload: Omit<Types.User, "score">) => void;
	[Events.START_GAME]: (payload: {
		sessionId: string;
	}) => void;
	[Events.LEAVE_SESSION]: (payload: Omit<Types.User, "score">) => void;
	[Events.SUBMIT_ANSWER]: (
		payload: Types.User & {
			answer: number;
		},
	) => void;
	[Events.DISCONNECT]: () => void;
}

export interface ServerToClientEvents {
	[Events.UPDATE_ANSWERS]: () => void;
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
	[Events.GAME_OVER]: (data: { finalScores: Types.Score[] }) => void;
	[Events.SESSION_CLOSED]: () => void;
}
