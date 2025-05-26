import type { GameSession, Question, User } from "@shared/core.types";
export type TriviaStore = {
	user: User | null;
	session: GameSession | null;
	currentQuestion: Question | null;
	error: string | null;
	loading: boolean;

	setState: (partial: Partial<TriviaStore>) => void;
	reset: () => void;

	addUser: (user: User) => void;
};
