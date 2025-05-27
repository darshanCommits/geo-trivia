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
	maxPlayers?: number;
	totalQuestions?: number;
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

export type Leaderboard = {
	username: string;
	score: number;
	rank: number;
}[];
