import { create, type StateCreator } from "zustand";
import type { TriviaStore } from "./game.store.types";

const defaults = {
	user: null,
	session: null,
	currentQuestion: null,
	error: null,
	loading: false,
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
				currentQuestion: null,
				error: null,
				loading: false,
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
