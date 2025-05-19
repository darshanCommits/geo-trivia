import type { Socket, Server as SocketIOServer } from "socket.io";
import type { SessionData } from "./types";

export function registerGameHandlers(
	socket: Socket,
	sessions: Map<string, SessionData>,
	io: SocketIOServer,
) {
	socket.on("start_game", ({ sessionId }) => {
		const session = sessions.get(sessionId);
		if (!session || session.hostId !== socket.id) return;

		const question = session.questions[0];

		io.to(sessionId).emit("question_prompt", {
			question,
			index: 0,
			total: session.questions.length,
		});
	});
}
