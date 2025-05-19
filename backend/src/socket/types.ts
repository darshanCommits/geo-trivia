import type { QuestionType } from "@shared/types";

export interface ClientToServerEvents {
	create_session: (data: { sessionId: string; username: string }) => void;
	join_session: (data: { sessionId: string; username: string }) => void;
	leave_session: () => void;
	disconnect: () => void;
}

type Score = {
	username: string;
	score: number;
};

type ServerToClientErrors = {
	session_exists: () => void;
	session_not_found: () => void;
	username_taken: () => void;
};

type ServerToClientUserEvents = {
	user_joined: (data: { username: string }) => void;
	user_left: (data: { userId: string }) => void;
};

export type ServerToClientEvents = ServerToClientErrors &
	ServerToClientUserEvents & {
		session_created: (data: {
			sessionId: string;
			username: string;
		}) => void;

		question_prompt: (data: {
			question: QuestionType;
			index: number;
			total: number;
		}) => void;

		answer_result: (data: {
			username: string;
			isAnswerCorrect: boolean;
			answer: number;
			scores: Score[];
		}) => void;

		game_over: (data: {
			finalScores: Score[];
		}) => void;

		session_closed: () => void;
	};

export type SocketData = {
	sessionId?: string; // Track user's session on the socket
	username?: string;
};

export type SessionData = {
	hostId: string;
	users: { id: string; username: string; score: number }[];
	questions: QuestionType[];
	currentQuestionIndex: number;
	answered: boolean;
};
