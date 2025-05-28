import { create, type StateCreator } from "zustand";
import type { TriviaState, TriviaStore } from "./game.store.types";
import type { GameSession } from "@shared/core.types";
import LeaderBoard from "@/pages/leaderboard";

const defaults: TriviaState = {
	user: null,
	session: null,
	question: null,
	error: null,
	loading: false,
	questionNumber: 0,
};

export function withLogging<T extends object>(
	config: StateCreator<T>,
): StateCreator<T> {
	return (set, get, api) =>
		config(
			(args) => {
				console.group("🧩 Zustand State Update");
				console.log("🔁 Partial state update:", args);
				console.groupEnd();
				set(args);
			},
			get,
			api,
		);
}

export const useTriviaStore = create<TriviaStore>(
	withLogging((set, get) => ({
		...defaults,
		setState: (partial) => set(partial),
		reset: () =>
			set({
				user: null,
				session: null,
				question: null,
				error: null,
				loading: false,
			}),

		setLeaderboard: (leaderboard) =>
			set((state) => ({
				...state,
				leaderboard: leaderboard,
			})),

		setGameStatus: (status: GameSession["status"]) =>
			set((state) => {
				if (!state.session) {
					throw new Error("Session does not exist");
				}
				return {
					...state,
					session: {
						...state.session,
						status,
					},
				};
			}),

		setQuestion: (q) => {
			const { session } = get();
			if (!session) return;

			set(() => ({
				question: q,
			}));
		},

		setTotalQuestions: (count: number) =>
			set((state) => ({
				...state,
				totalQuestions: count,
			})),

		setQuestionNumber: (queNo) =>
			set((state) => {
				return {
					...state,
					questionNumber: queNo,
				};
			}),

		addUser: (newUser) => {
			const { session } = get();

			if (!session) {
				return;
			}

			const userExists = session.users.some(
				(user) => user.username === newUser.username,
			);

			if (userExists) {
				return;
			}

			set({
				session: {
					...session,
					users: [...session.users, newUser],
				},
			});
		},
	})),
);
