import { create } from "zustand";

const SOCKET_URL = "http://localhost:3000";

// critical error if socket doesn't exist
// application cannot work without it
type SocketState = {
	socket: string; // this should be hardcoded no need for a method
	isSocketConnected: boolean; // Socket Connection status
};

type SocketActions = {
	setConnectionStatus: (status: boolean) => void;
};

export const useSocketStore = create<SocketState & SocketActions>((set) => ({
	socket: SOCKET_URL, // This would be your socket instance in a real scenario
	isSocketConnected: false,

	// Actions
	setConnectionStatus: (status) => set({ isSocketConnected: status }),
}));

const defaultValues: SocketState = {
	socket: SOCKET_URL, // This would be your socket instance in a real scenario
	isSocketConnected: false,
};
