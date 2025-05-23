// --- Event Constants ---
export namespace Events {
	export const CREATE_SESSION = "create_session";
	export const DISCONNECT = "disconnect";
	export const CONNECTED = "connected";

	export const SESSION_CREATION_FAILED = "session_creation_failed";
	export const SESSION_NOT_FOUND = "session_not_found";

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

	export type Score = {
		username: string;
		score: number;
	};

	export type User = {
		id?: string;
		username: string;
		sessionId: string;
	};

	export type GameUser = User & {
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

type CTSGameEvents = {
	[Events.SUBMIT_ANSWER]: (
		payload: Types.User & {
			answer: number;
		},
	) => void;
};

export type ClientToServerEvents = CTSGameEvents & {
	[Events.DISCONNECT]: () => void;
	[Events.CREATE_SESSION]: (payload: Omit<Types.User, "id">) => void;
	[Events.JOIN_SESSION]: (payload: Omit<Types.User, "id">) => void;
	[Events.LEAVE_SESSION]: (payload: Omit<Types.User, "id">) => void;
	[Events.START_GAME]: (payload: {
		sessionId: string;
	}) => void;
};

export interface ServerToClientEvents {
	[Events.UPDATE_ANSWERS]: () => void;
	[Events.SESSION_CREATED]: (payload: Types.User) => void;
	[Events.SESSION_EXISTS]: () => void;
	[Events.USERNAME_TAKEN]: () => void;
	[Events.USER_JOINED]: (payload: Types.User) => void;
	[Events.USER_LEFT]: (payload: Types.User) => void;
	[Events.QUESTION_PROMPT]: (payload: {
		question: Types.QuestionType;
		index: number;
		total: number;
	}) => void;
	[Events.GAME_OVER]: (payload: { finalScores: Types.Score[] }) => void;
	[Events.SESSION_CLOSED]: () => void;
	[Events.ERROR]: (payload: {
		message: string;
	}) => void;
	[Events.SESSION_CREATION_FAILED]: (payload: { message: string }) => void;
	[Events.SESSION_NOT_FOUND]: () => void;
}
