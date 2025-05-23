import { Socket, Server as SocketIOServer } from "socket.io";
import { Events, type Types } from "@shared/types";
import { serverEmit } from "@backend/utils/emit";

export function registerUserHandlers(
	socket: Socket,
	sessions: Types.Sessions,
	io: SocketIOServer,
) {
	const emit = serverEmit(socket);

	// Error handling wrapper
	const handleError = (error: Error | unknown, context: string) => {
		console.error(`Error in ${context}:`, error);
		emit(Events.ERROR, {
			message: `Something went wrong: ${(error as Error).message}`,
		});
	};

	socket.on(Events.DISCONNECT, () => {
		try {
			const { sessionId } = socket.data;
			if (!sessionId) {
				console.warn("User disconnected, no sessionId found");
				return;
			}

			const session = sessions.get(sessionId);
			if (!session) {
				console.warn(`Session ${sessionId} not found for disconnection`);
				return;
			}

			// Remove user from session
			session.users = session.users.filter((u) => u.id !== socket.id);
			socket.to(sessionId).emit(Events.USER_LEFT, { userId: socket.id });

			// If the host disconnected or there are no users left, close the session
			if (session.hostId === socket.id || session.users.length === 0) {
				sessions.delete(sessionId);
				socket.to(sessionId).emit(Events.SESSION_CLOSED);
				console.log(`Session ${sessionId} closed on disconnect`);
			}
		} catch (error) {
			handleError(error, "DISCONNECT handler");
		}
	});

	socket.on(Events.LEAVE_SESSION, async ({ sessionId, username }) => {
		try {
			const { sessionId } = socket.data;
			if (!sessionId) {
				console.warn("User attempted to leave session, but no sessionId found");
				return;
			}

			const session = sessions.get(sessionId);
			if (!session) {
				console.warn(`Session ${sessionId} not found for leaving`);
				return;
			}

			// Remove user from session
			session.users = session.users.filter((u) => u.id !== socket.id);

			socket.to(sessionId).emit(Events.USER_LEFT, {
				sessionId: sessionId,
				username: username,
			});

			// If the host disconnected or there are no users left, close the session
			if (session.hostId === socket.id || session.users.length === 0) {
				sessions.delete(sessionId);
				socket.to(sessionId).emit(Events.SESSION_CLOSED);
				console.log(`Session ${sessionId} closed on leave`);
			}

			// Clean up socket data
			socket.data.sessionId = undefined;
			socket.data.username = undefined;
		} catch (error) {
			handleError(error, "LEAVE_SESSION handler");
		}
	});
}
