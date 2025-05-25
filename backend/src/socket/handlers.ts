import { createUser } from "@backend/utils/lib";
import { gameServer } from ".";

gameServer.handle("session:create", async (data, socket) => {
	const user = createUser(data.username);

	gameServer.setSocketData(socket, {
		username: user.username,
		sessionId: user.sessionId,
		user,
	});

	gameServer.createRoom(socket, user.sessionId, user.username);

	return {
		user,
		session: {
			id: user.sessionId,
			hostUsername: user.username,
			players: [user],
			status: "waiting",
		},
	};
});

gameServer.handle("session:join", async (data, socket) => {
	const user = createUser(data.username, data.sessionId);

	gameServer.setSocketData(socket, {
		username: user.username,
		sessionId: user.sessionId,
		user,
	});

	gameServer.joinRoom(socket, user.sessionId, user.username);

	return { user };
});

gameServer.handle("session:leave", async (data, socket) => {
	const { username, sessionId } = data;

	if (!username || !sessionId) {
		gameServer.emit(socket, "session:leave-failed", {
			reason: "user_not_found",
			message: "User not found or not in a session.",
		});
		return {
			sessionId: "",
			username: "",
		};
	}

	gameServer.leaveRoom(socket, sessionId, username);

	return {
		sessionId,
		username: username,
	};
});
