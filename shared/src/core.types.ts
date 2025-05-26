// ============================================================================
// CORE DOMAIN TYPES
// ============================================================================

// this is for zustand
export interface GameState {
	// Connection
	connected: boolean;
	connecting: boolean;

	// User & Session
	user: User | null;
	session: GameSession | null;

	// Game State
	currentQuestion:
		| (Question & { questionNumber: number; totalQuestions: number })
		| null;
	leaderboard: Leaderboard;

	// UI State
	error: string | null;
	loading: boolean;

	// Game-specific UI state
	showCorrectAnswer: boolean;
	lastCorrectAnswer: number | null;
	explanation: string | null;
}

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
	players: User[];
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
