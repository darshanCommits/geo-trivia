import type { GameSession, User } from "@shared/types";
import { server } from "../http.server";
import { TriviaGameServer } from "./TriviaGameServer";
import { createUser } from "@backend/utils/lib";

export const gameServer = new TriviaGameServer(server);

// import { createUser } from "@backend/utils/lib";
// import { gameServer } from ".";

gameServer.handle("session:create", async (data, socket) => {
	const user = createUser(data.username);

	const session: GameSession = {
		id: user.sessionId,
		hostUsername: user.username,
		status: "waiting",
		players: [user],
	};

	gameServer.setSocketData(socket, {
		session,
	});

	gameServer.sessions.set(user.sessionId, session);
	gameServer.logSocketData("createRoom", socket.data);

	socket.join(user.sessionId);

	gameServer.broadcastToSession(user.sessionId, "session:user-joined", user);

	return {
		user,
		session,
	};
});

gameServer.handle("session:join", async (data, socket) => {
	const user = createUser(data.username, data.sessionId);
	const session = gameServer.sessions.get(user.sessionId);

	gameServer.logSocketData("joinRoom", socket.data);

	if (!session) {
		gameServer.emit(socket, "session:join-failed", {
			reason: "session_not_found",
			message: "The requested session could not be found",
			sessionId: user.sessionId,
		});
		throw new Error("session_not_found");
	}

	if (session.players.find((u) => u.username === user.username)) {
		gameServer.emit(socket, "session:join-failed", {
			reason: "username_taken",
			message: "Username is already taken by somebody else",
		});
		throw new Error("username_taken");
	}

	session.players.push(user);
	gameServer.setSocketData(socket, {
		user,
		session,
	});

	socket.join(user.sessionId);
	gameServer.logSocketData("joinRoom", socket.data);

	gameServer.broadcastToSession(user.sessionId, "session:user-joined", user);

	return { user };
});

gameServer.handle("session:leave", async (data, socket) => {
	const user: User = data;
	const session = gameServer.sessions.get(user.sessionId);

	if (!session) {
		gameServer.emit(socket, "session:leave-failed", {
			reason: "session_not_found",
			message: "No Such Session Exists",
		});
		throw new Error("session_not_found");
	}

	if (!user.username) {
		gameServer.emit(socket, "session:leave-failed", {
			reason: "user_not_found",
			message: "User not found.",
		});
		throw new Error("user_not_found");
	}

	gameServer.logSocketData("leaveRoom", socket.data);

	// Remove the leaving user from the players list
	session.players = session.players.filter((u) => u.username !== user.username);

	// If host is leaving, broadcast session deleted and remove session
	if (session.hostUsername === user.username) {
		gameServer.broadcastToSession(user.sessionId, "session:deleted", {
			sessionId: user.sessionId,
			reason: "host_left",
		});
		gameServer.sessions.delete(user.sessionId);
		gameServer.setSocketData(socket, {});
		return user;
	}

	// If non-host is leaving
	gameServer.broadcastToSession(user.sessionId, "session:user-left", user);

	// If no players remain, delete session
	if (session.players.length === 0) {
		gameServer.broadcastToSession(user.sessionId, "session:deleted", {
			sessionId: user.sessionId,
			reason: "No Players Remaining",
		});
		gameServer.sessions.delete(user.sessionId);
	}

	gameServer.setSocketData(socket, {});
	return user;
});
