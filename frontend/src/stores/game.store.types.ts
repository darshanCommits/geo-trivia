import type {
	GameSession,
	Leaderboard,
	Question,
	User,
} from "@shared/core.types";
export type TriviaState = {
	user: User | null;
	session: GameSession | null;
	question: Omit<Question, "correctAnswer"> | null;
	error: string | null;
	loading: boolean;
	questionNumber: number;
	leaderboard?: Leaderboard;
};

export type TriviaStore = TriviaState & {
	setState: (partial: Partial<TriviaStore>) => void;
	reset: () => void;

	addUser: (user: User) => void;
	setGameStatus: (status: GameSession["status"]) => void;
	setLeaderboard: (leaderboard: Leaderboard) => void;
	setTotalQuestions: (count: number) => void;
	setQuestion: (q: TriviaState["question"]) => void;
	setQuestionNumber: (count: TriviaState["questionNumber"]) => void;
};
