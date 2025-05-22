// useSessionStore.ts
import { create } from "zustand";
import type { Types } from "@shared/types";

export interface SessionState {
	sessionId: string | null;
	username: string | null;
	users: Types.User[];
	hostId: string | null;
	isHost: boolean;
	error: string | null;
	isLoading: boolean;
	joinedAt: Date | null;
	status: string;
}

export interface SessionStore extends SessionState {
	setSessionState: (partial: Partial<SessionState>) => void;
	resetSession: () => void;
	addUser: (username: string, sessionId: string) => void;
	removeUser: (userId: string) => void;
}

export const initialSessionState: SessionState = {
	sessionId: null,
	username: null,
	users: [],
	hostId: null,
	isHost: false,
	error: null,
	isLoading: false,
	joinedAt: null,
	status: "",
};
const createUser = (username: string, sessionId: string): Types.User => {
	return {
		username,
		id: `${username}-${sessionId}`,
		score: 0,
	};
};

export const useSessionStore = create<SessionStore>((set, get) => ({
	...initialSessionState,
	setSessionState: (partial) => set((state) => ({ ...state, ...partial })),
	resetSession: () => set(() => ({ ...initialSessionState })),
	addUser: (username, sessionId) => {
		const newUser = createUser(username, sessionId);
		set((state) => ({ users: [...state.users, newUser] }));
	},
	removeUser: (userId) =>
		set((state) => ({
			users: state.users.filter((user) => user.id !== userId),
		})),
}));
