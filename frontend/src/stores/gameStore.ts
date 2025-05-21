import { create } from "zustand";
import type { Types } from "@shared/types";

interface GameState {
	currentQuestion: Types.QuestionType | null;
	questionIndex: number;
	totalQuestions: number;
	answerResult: {
		username: string;
		isAnswerCorrect: boolean;
		answer: number;
	} | null;
	currentScores: Types.Score[];
	gameOver: boolean;
	finalScores: Types.Score[] | null;
	isLoading: boolean;
	error: string | null;
	timer: number | null;
}

interface GameActions {
	setCurrentQuestion: (
		question: Types.QuestionType,
		index: number,
		total: number,
	) => void;
	setAnswerResult: (
		username: string,
		isAnswerCorrect: boolean,
		answer: number,
		scores: Types.Score[],
	) => void;
	setGameOver: (finalScores: Types.Score[]) => void;
	setSessionClosed: () => void;
	setLoading: (loading: boolean) => void;
	setError: (error: string | null) => void;
	setTimer: (timer: number | null) => void;
	reset: () => void;
}

const initialState: GameState = {
	currentQuestion: null,
	questionIndex: -1,
	totalQuestions: 0,
	answerResult: null,
	currentScores: [],
	gameOver: false,
	finalScores: null,
	isLoading: false,
	error: null,
	timer: null,
};

export const useGameStore = create<GameState & GameActions>((set) => {
	let timerId: number | null = null;
	let startTime = 0;
	let timeoutMs = 0;

	const clearTimer = () => {
		if (timerId) {
			clearInterval(timerId);
			timerId = null;
		}
	};

	return {
		...initialState,

		setCurrentQuestion: (question, index, total) => {
			clearTimer();
			timeoutMs = question.timeout * 1000;
			startTime = Date.now();

			set({
				currentQuestion: question,
				questionIndex: index,
				totalQuestions: total,
				answerResult: null,
				gameOver: false,
				isLoading: false,
				error: null,
				timer: question.timeout,
			});

			timerId = window.setInterval(() => {
				const elapsed = Date.now() - startTime;
				const remainingMs = Math.max(0, timeoutMs - elapsed);
				const remainingSec = Math.ceil(remainingMs / 1000);
				set({ timer: remainingSec });

				if (remainingMs <= 0) {
					clearTimer();
				}
			}, 500);
		},

		setAnswerResult: (username, isAnswerCorrect, answer, scores) => {
			clearTimer();
			set({
				answerResult: { username, isAnswerCorrect, answer },
				currentScores: scores,
				isLoading: false,
			});
		},

		setGameOver: (finalScores) => {
			clearTimer();
			set({
				gameOver: true,
				finalScores,
				currentQuestion: null,
				timer: null,
				isLoading: false,
			});
		},

		setSessionClosed: () => {
			clearTimer();
			set(initialState);
		},

		setLoading: (loading) => set({ isLoading: loading }),

		setError: (error) => set({ error }),

		setTimer: (timer) => set({ timer }),

		reset: () => {
			clearTimer();
			set(initialState);
		},
	};
});
