import type { Socket, Server as SocketIOServer } from "socket.io";
import type { Types } from "@shared/types";
import { Events } from "@shared/types";

export function registerGameHandlers(
	socket: Socket,
	sessions: Types.Sessions,
	io: SocketIOServer,
) {
	socket.on(Events.START_GAME, ({ sessionId }) => {
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
