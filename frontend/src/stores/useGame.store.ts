import { create } from "zustand";
import type { Types } from "@shared/types";
import type { GameState, GameStore } from "./types";

export const initialGameState: GameState = {
	currentQuestion: null,
	currentQuestionIndex: 0,
	totalQuestions: 0,
	timer: null,
	answerResult: null,
	currentScores: [],
	finalScores: [],
	isGameOver: false,
	isGameStarted: false,
	isLoading: false,
	error: null,
	hasSubmittedAnswer: false,

	topPlayerUsername: null,
};

export const useGameStore = create<GameStore>((set, get) => ({
	...initialGameState,

	setGameStarted: (started) =>
		set(() => ({
			isGameStarted: started,
			isGameOver: !started,
		})),

	setGameOver: (finalScores) =>
		set(() => ({
			isGameOver: true,
			isGameStarted: false,
			finalScores,
			isLoading: false,
		})),

	setCurrentQuestion: (question, index, total) =>
		set(() => ({
			currentQuestion: question,
			currentQuestionIndex: index,
			totalQuestions: total,
			timer: question.timeout,
			hasSubmittedAnswer: false,
			answerResult: null,
		})),

	setTimer: (timer) => set(() => ({ timer })),

	setAnswerResult: (username, isAnswerCorrect, answer) =>
		set(() => ({
			answerResult: { username, isAnswerCorrect, answer },
			isLoading: false,
		})),

	setLoading: (loading) => set(() => ({ isLoading: loading })),

	setError: (error) => set(() => ({ error })),

	setHasSubmittedAnswer: (submitted) =>
		set(() => ({ hasSubmittedAnswer: submitted })),

	setCurrentScores: (scores) => {
		const currentScores = get().currentScores;

		// Quick length check first
		if (currentScores.length === scores.length) {
			// Compare by reference for fast equality check
			if (currentScores === scores) return;

			// Avoid expensive deep equality on large arrays
			let equal = true;
			for (let i = 0; i < currentScores.length; i++) {
				const a = currentScores[i];
				const b = scores[i];
				if (a.username !== b.username || a.score !== b.score) {
					equal = false;
					break;
				}
			}
			if (equal) return; // no change, don't update
		}

		// Update currentScores and also cache the top player username for O(1) first place check
		const topPlayer = scores.reduce<string | null>(
			(top, s) =>
				top === null ||
				s.score >
					(scores.find((x) => x.username === top)?.score ??
						Number.NEGATIVE_INFINITY)
					? s.username
					: top,
			null,
		);

		set(() => ({
			currentScores: scores,
			topPlayerUsername: topPlayer,
		}));
	},

	resetGame: () => set(() => initialGameState),

	hasAnswered: (username) => {
		const state = get();
		// clarify: hasSubmittedAnswer means the current user (or globally?),
		// safer to only check answerResult for that username
		return state.answerResult?.username === username;
	},

	getCurrentPlayerScore: (username) => {
		const state = get();
		return state.currentScores.find((s) => s.username === username)?.score ?? 0;
	},

	isPlayerInFirstPlace: (username) => {
		const { topPlayerUsername } = get();
		return topPlayerUsername === username;
	},

	setState: (partial) => set(() => partial),
}));
