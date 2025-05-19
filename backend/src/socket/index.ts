import type { SessionData } from "./types";
import { type Socket, Server as SocketIOServer } from "socket.io";
import type {
	ClientToServerEvents,
	ServerToClientEvents,
	SocketData,
} from "./types";
import { server } from "../http.server";
import { registerUserHandlers } from "./user.handler";
import { registerSessionHandlers } from "./session.handler";
import { registerGameHandlers } from "./game.handler";

export const sessions = new Map<string, SessionData>();

export const io = new SocketIOServer<
	ClientToServerEvents,
	ServerToClientEvents,
	// biome-ignore lint/suspicious/noExplicitAny:
	any,
	SocketData
>(server, {
	cors: {
		origin: "http://localhost:5173",
	},
});

io.on("connection", (socket) => {
	registerSessionHandlers(socket, sessions);
	registerUserHandlers(socket, sessions, io);
	registerGameHandlers(socket, sessions, io);
});
