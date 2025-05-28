// ============================================================================
// CORE DOMAIN TYPES
// ============================================================================

export type SocketData = {
	user?: User;
	session?: GameSession;
	activeGameQuestions?: Question[];
};

export type User = {
	username: string;
	score: number; // lets initialize this with 0
};

export type GameSession = {
	sessionId: string;
	hostUsername: string;
	users: User[];
	status: "waiting" | "active" | "finished";
	currentQuestion?: Question;
	currentQuestionNumber: number;
	maxPlayers?: number;
	totalQuestions?: number;
	eventLockState: "CAN_REQUEST_QUESTION" | "CAN_SUBMIT_ANSWER"; // Initial expected action
};

export type Question = {
	index?: number; // this is for client only, server will send but not store
	text: string;
	options: string[];
	correctAnswer: number;
	region: string;
	timeout: number;
};

export type Answer = {
	questionNumber: number;
	selectedOption: number;
	timeRemaining: number;
};

export type Leaderboard = Array<
	User & {
		rank: number;
	}
>;
