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
		data: {
			user,
			session,
		},
		success: true,
	};
});

// Using the refactored TriviaGameServer
gameServer.handle("session:join", async (data, socket) => {
	const user: User = {
		username: data.username,
		score: 0,
	};
	const session = gameServer.sessions.get(data.sessionId);
	gameServer.logSocketData("joinRoom", socket.data);

	if (!session) {
		// No need to manually emit failure events anymore - the server handles this automatically
		return {
			success: false,
			error: {
				reason: "session_not_found",
				message: "Session not found. Please check the code and try again.",
			},
		};
	}

	if (session.users.find((u) => u.username === user.username)) {
		return {
			success: false,
			error: {
				reason: "username_taken",
				message: "Username already taken. Please choose another one.",
			},
		};
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
		success: true,
		data: {
			user,
			session,
		},
	};
});

gameServer.handle("session:leave", async (data, socket) => {
	const session = gameServer.sessions.get(data.sessionId);

	if (!session) {
		return {
			success: false,
			error: {
				reason: "session_not_found",
				message: "No Such Session Exists",
			},
		};
	}

	if (!data.username) {
		return {
			success: false,
			error: {
				reason: "user_not_found",
				message: "User not found.",
			},
		};
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

		return {
			success: true,
			data: data,
		};
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
	return {
		success: true,
		data: data,
	};
});
