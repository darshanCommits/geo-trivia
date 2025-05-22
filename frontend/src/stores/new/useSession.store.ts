import { create } from "zustand";

// cannot exist if socketStore is null
// meaning react can only create a session if its connected to a socket
type SessionState = {
	sessionId: string | null; // Unique session ID
	username: string | null; // Current user's username
	isSessionConnected: boolean; // Socket connection status
};

type SessionActions = {
	createSession: (sessionId: string, username: string) => void;
	joinSession: (sessionId: string, username: string) => void;
	exitSession: () => void;
	setConnectionStatus: (status: boolean) => void;
};

export const useSessionStore = create<SessionState & SessionActions>((set) => ({
	...defaultValues,

	createSession: (sessionId, username) => set({ sessionId, username }),
	joinSession: (sessionId, username) => set({ sessionId, username }),
	exitSession: () => set({ sessionId: null, username: null }),
	setConnectionStatus: (status) => set({ isSessionConnected: status }),
}));

const defaultValues: SessionState = {
	sessionId: null,
	username: null,
	isSessionConnected: false,
};
