import type { Socket } from "socket.io";
import type { SessionData } from "./types";
import { fetchQuestions } from "@backend/services/question.service";

export function registerSessionHandlers(
	socket: Socket,
	sessions: Map<string, SessionData>,
) {
	socket.on("create_session", async ({ sessionId, username }) => {
		if (sessions.has(sessionId)) {
			socket.emit("session_exists");
			return;
		}

		try {
			const questions = await fetchQuestions("Delhi", 10);

			sessions.set(sessionId, {
				hostId: socket.id,
				users: [{ id: socket.id, username, score: 0 }],
				questions,
				currentQuestionIndex: 0,
				answered: false,
			});

			socket.data.sessionId = sessionId;
			socket.data.username = username;

			socket.join(sessionId);
			socket.emit("session_created", { sessionId, username });
			console.log(`Session ${sessionId} created by ${username}`);
		} catch (err) {
			console.error("Failed to fetch questions during session creation:", err);
			socket.emit("session_creation_failed", {
				message: "Could not generate questions. Try again later.",
			});
		}
	});

	socket.on("join_session", ({ sessionId, username, score }) => {
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

		session.users.push({ id: socket.id, username, score });

		socket.data.sessionId = sessionId;
		socket.data.username = username;

		socket.join(sessionId);
		socket.to(sessionId).emit("user_joined", { username });
		console.log(`${username} joined session ${sessionId}`);
	});

}
