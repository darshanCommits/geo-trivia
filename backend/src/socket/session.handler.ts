import type { Socket } from "socket.io";
import { fetchMockQuestions } from "@backend/services/question.service";
import { Events, type Types } from "@shared/types";
import { serverEmit } from "@backend/utils/emit";

export function registerSessionHandlers(
	socket: Socket,
	sessions: Types.Sessions,
) {
	const emit = serverEmit(socket);
	socket.on(Events.CREATE_SESSION, async ({ sessionId, username }) => {
		console.log("Received CREATE_SESSION with:", sessionId, username);
		if (sessions.has(sessionId)) {
			emit(Events.SESSION_EXISTS);
			return;
		}

		try {
			const questions = await fetchMockQuestions();

			sessions.set(sessionId, {
				hostId: socket.id,
				users: [{ id: socket.id, username, score: 0 }],
				questions,
				currentQuestionIndex: 0,
				answered: false,
			});
			console.log({ sessionId, username });

			socket.data.sessionId = sessionId;
			socket.data.username = username;

			socket.join(sessionId);

			emit(Events.SESSION_CREATED, {
				id: `${sessionId}-${username}`,
				username,
				sessionId,
			});

			console.log(`Session ${sessionId} created by ${username}`);
		} catch (err) {
			console.error("Failed to fetch questions during session creation:", err);

			emit(Events.SESSION_CREATION_FAILED, {
				message: "Could not generate questions. Try again later.",
			});
		}
	});

	socket.on(Events.JOIN_SESSION, ({ sessionId, username, score }) => {
		const session = sessions.get(sessionId);
		if (!session) {
			emit(Events.SESSION_NOT_FOUND);
			return;
		}

		const usernameTaken = session.users.some((u) => u.username === username);
		if (usernameTaken) {
			socket.emit(Events.USERNAME_TAKEN);
			return;
		}

		session.users.push({ id: socket.id, username, score });

		socket.data.sessionId = sessionId;
		socket.data.username = username;

		socket.join(sessionId);
		socket.to(sessionId).emit(Events.USER_JOINED, {
			id: `${sessionId}-${username}`,
			username,
			sessionId,
		});
		console.log(`${username} joined session ${sessionId}`);
	});
}
