import { Server as SocketIOServer } from "socket.io";
import type {
	ClientToServerEvents,
	ServerToClientEvents,
	SocketData,
} from "./types";
import { httpServer } from "../server";
import { registerSocketHandlers } from "./handlers";

export const io = new SocketIOServer<
	ClientToServerEvents,
	ServerToClientEvents,
	// biome-ignore lint/suspicious/noExplicitAny:
	any,
	SocketData
>(httpServer, {
	cors: {
		origin: "http://localhost:5173",
	},
});

io.on("connection", (socket) => {
	registerSocketHandlers(socket);
});
