// src/store/gameStore.ts
import { create } from "zustand";
import type { Types } from "@shared/types";

// cannot exist if sessionStore is null
// meaning react can only create a game if its connected to a session
interface GameState {
	question: string | null;
	currentIndex: number;
	totalQuestions: number;
	scores: Types.Score[];
	gameOver: boolean;
	isPending: boolean;
	timer: number;
}

interface GameActions {
	setScores: (scores: Types.Score[]) => void;
	updateScore: (username: string, score: number) => void;
	endGame: () => void;
}

export const useGameStore = create<GameState & GameActions>((set) => ({
	...defaultValues,
	// Actions
	setScores: (scores) => set({ scores }),
	updateScore: (username, score) =>
		set((state) => ({
			scores: state.scores.map((s) =>
				s.username === username ? { ...s, score } : s,
			),
		})),
	endGame: () => set({ gameOver: true }),
}));

const defaultValues: GameState = {
	question: null,
	currentIndex: 0,
	totalQuestions: 0,
	scores: [],
	gameOver: false,
	isPending: true,
	timer: 0,
};
