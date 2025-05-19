import type { Socket } from "socket.io";
import { sessions } from "./sessions";
import type { SessionData } from "./types";

export function registerSocketHandlers(socket: Socket) {
	console.log("New socket connected:", socket.id);

	socket.on("create_session", ({ sessionId, username }) => {
		if (sessions.has(sessionId)) {
			socket.emit("session_exists");
			return;
		}

		sessions.set(sessionId, {
			hostId: socket.id,
			users: [{ id: socket.id, username }],
		});

		socket.data.sessionId = sessionId;
		socket.data.username = username;

		socket.join(sessionId);
		socket.emit("session_created", { sessionId, username });
		console.log(`Session ${sessionId} created by ${username}`);
	});

	socket.on("join_session", ({ sessionId, username }) => {
		const session = sessions.get(sessionId);
		if (!session) {
			socket.emit("session_not_found");
			return;
		}

		const usernameTaken = session.users.some((u) => u.username === username);
		if (usernameTaken) {
			socket.emit("username_taken");
			return;
		}

		session.users.push({ id: socket.id, username });

		socket.data.sessionId = sessionId;
		socket.data.username = username;

		socket.join(sessionId);
		socket.to(sessionId).emit("user_joined", { username });
		console.log(`${username} joined session ${sessionId}`);
	});

	socket.on("leave_session", () => {
		const { sessionId } = socket.data;
		if (!sessionId) return;

		const session = sessions.get(sessionId);
		if (!session) return;

		session.users = session.users.filter((u) => u.id !== socket.id);
		socket.to(sessionId).emit("user_left", { userId: socket.id });

		if (session.hostId === socket.id || session.users.length === 0) {
			sessions.delete(sessionId);
			socket.to(sessionId).emit("session_closed");
			console.log(`Session ${sessionId} closed`);
		}

		socket.data.sessionId = undefined;
		socket.data.username = undefined;
	});

	socket.on("disconnect", () => {
		const { sessionId } = socket.data;
		if (!sessionId) return;

		const session = sessions.get(sessionId);
		if (!session) return;

		session.users = session.users.filter((u) => u.id !== socket.id);
		socket.to(sessionId).emit("user_left", { userId: socket.id });

		if (session.hostId === socket.id || session.users.length === 0) {
			sessions.delete(sessionId);
			socket.to(sessionId).emit("session_closed");
			console.log(`Session ${sessionId} closed on disconnect`);
		}
	});
}
