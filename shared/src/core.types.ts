// ============================================================================
// CORE DOMAIN TYPES
// ============================================================================

export type SocketData = {
	user?: User;
	session?: GameSession;
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
	index: number;
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

export type Leaderboard = {
	username: string;
	score: number;
	rank: number;
}[];
