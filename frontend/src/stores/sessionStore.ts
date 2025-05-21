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

export const useSessionStore = create<SessionStore>((set) => ({
	...initialSessionState,
	setSessionState: (partial) => set((state) => ({ ...state, ...partial })),
	resetSession: () => set(() => ({ ...initialSessionState })),
}));
