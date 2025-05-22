import { Server as SocketIOServer } from "socket.io";
import type {
	ClientToServerEvents,
	ServerToClientEvents,
	Types,
} from "@shared/types";
import { server } from "../http.server";
import { registerUserHandlers } from "./user.handler";
import { registerSessionHandlers } from "./session.handler";
import { registerGameHandlers } from "./game.handler";

export const sessions: Types.Sessions = new Map();

export const io = new SocketIOServer<
	ClientToServerEvents,
	ServerToClientEvents,
	// biome-ignore lint/suspicious/noExplicitAny:
	any,
	Types.User
>(server, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
		allowedHeaders: ["Content-Type"], // You can add more headers if needed
		credentials: false, // Set to true if you need credentials (cookies, etc.)
	},
});

io.on("connection", (socket) => {
	registerSessionHandlers(socket, sessions);
	registerUserHandlers(socket, sessions, io);
	registerGameHandlers(socket, sessions, io);
});
