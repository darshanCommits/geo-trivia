import type { GameSession, User } from "@shared/core.types";
import { server } from "../http.server";
import { TriviaGameServer } from "./TriviaGameServer";
import { generateSessionId } from "@backend/utils/lib";

export const gameServer = new TriviaGameServer(server);

gameServer.handle("session:create", async (data, socket) => {
	const user: User = {
		username: data.username,
		score: 0,
	};

	const session: GameSession = {
		sessionId: generateSessionId(),
		hostUsername: user.username,
		status: "waiting",
		users: [user],
	};

	gameServer.sessions.set(session.sessionId, session);
	gameServer.setSocketData(socket, {
		user,
		session,
	});

	socket.join(session.sessionId);
	gameServer.broadcastToSession(session.sessionId, "session:user-joined", user);

	return {
		user,
		session,
	};
});

gameServer.handle("session:join", async (data, socket) => {
	const user: User = {
		username: data.username,
		score: 0,
	};

	const session = gameServer.sessions.get(data.sessionId);

	gameServer.logSocketData("joinRoom", socket.data);

	if (!session) {
		gameServer.emit(socket, "session:join-failed", {
			reason: "session_not_found",
			message: "The requested session could not be found",
			sessionId: data.sessionId,
		});
		throw new Error("session_not_found");
	}

	if (session.users.find((u) => u.username === user.username)) {
		gameServer.emit(socket, "session:join-failed", {
			reason: "username_taken",
			message: "Username is already taken by somebody else",
		});
		throw new Error("username_taken");
	}

	session.users.push(user);
	gameServer.setSocketData(socket, {
		user,
		session,
	});

	socket.join(data.sessionId);
	gameServer.logSocketData("joinRoom", socket.data);

	gameServer.broadcastToSession(data.sessionId, "session:user-joined", user);

	return {
		user,
		session,
	};
});

gameServer.handle("session:leave", async (data, socket) => {
	const session = gameServer.sessions.get(data.sessionId);

	if (!session) {
		gameServer.emit(socket, "session:leave-failed", {
			reason: "session_not_found",
			message: "No Such Session Exists",
		});
		throw new Error("session_not_found");
	}

	if (!data.username) {
		gameServer.emit(socket, "session:leave-failed", {
			reason: "user_not_found",
			message: "User not found.",
		});
		throw new Error("user_not_found");
	}

	gameServer.logSocketData("leaveRoom", socket.data);

	// Remove the leaving user from the players list
	session.users = session.users.filter((u) => u.username !== data.username);

	// If host is leaving, broadcast session deleted and remove session
	if (session.hostUsername === data.username) {
		gameServer.broadcastToSession(data.sessionId, "session:deleted", {
			sessionId: data.sessionId,
			reason: "host_left",
		});
		gameServer.sessions.delete(data.sessionId);
		gameServer.setSocketData(socket, {});

		return data;
	}

	// If non-host is leaving
	gameServer.broadcastToSession(data.sessionId, "session:user-left", data);

	// If no players remain, delete session
	if (session.users.length === 0) {
		gameServer.broadcastToSession(data.sessionId, "session:deleted", {
			sessionId: data.sessionId,
			reason: "No Players Remaining",
		});
		gameServer.sessions.delete(data.sessionId);
	}

	gameServer.setSocketData(socket, {});
	return data;
});
