import type { Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "@shared/types";

// This ref holds the current socket instance globally
export const socketRef: {
	current: Socket<ServerToClientEvents, ClientToServerEvents> | null;
} = {
	current: null,
};
