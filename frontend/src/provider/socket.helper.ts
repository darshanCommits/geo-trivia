import { Events, type Types } from "@shared/types";
import type { FnTypes } from "./types";

export const createEmitFunction: FnTypes.CreateEmitFunction = (socketRef) => {
	return (event, ...args) => {
		if (socketRef.current?.connected) {
			socketRef.current.emit(event, ...args);
		} else {
			console.warn(
				`Attempted to emit event "${String(event)}" but socket is not connected.`,
			);
		}
	};
};

export const createConnectionHandler: FnTypes.CreateConnectionHandler =
	(socketStore) => () => {
		console.log("Socket.IO connected");
		socketStore({
			isConnected: true,
			socketState: "connected",
			lastError: null,
			reconnectAttempt: 0,
		});
	};

export const createDisconnectHandler: FnTypes.CreateDisconnectHandler =
	(socketStore) => (reason) => {
		console.log("Socket.IO disconnected:", reason);
		socketStore({ isConnected: false, socketState: "disconnected" });
	};

export const createConnectErrorHandler: FnTypes.CreateConnectErrorHandler =
	(socketStore) => (err) => {
		console.error("Socket.IO connection error:", err);
		socketStore({
			lastError: err,
			isConnected: false,
			socketState: "disconnected",
		});
	};

export const createSessionCreatedHandler: FnTypes.CreateSessionCreatedHandler =
	(socketRef, sessionStore) => (payload) => {
		console.log(Events.SESSION_CREATED, payload);
		sessionStore({
			sessionId: payload.sessionId,
			username: payload.username,
			hostId: socketRef.current?.id ?? null,
			isHost: true,
			error: null,
			isLoading: false,
			joinedAt: new Date(),
			status: `Session "${payload.sessionId}" created.`,
		});
		sessionStore.addUser({
			id: socketRef.current?.id ?? `temp-${Math.random()}`,
			username: payload.username,
			score: 0,
		});
	};

export const createUserJoinedHandler: FnTypes.CreateUserJoinedHandler =
	(socketRef, sessionStore) => (payload) => {
		console.log("USER_JOINED:", payload);

		const isOwnJoin = socketRef.current?.id === payload.id;

		if (isOwnJoin) {
			sessionStore({
				isLoading: false,
				error: null,
				joinedAt: new Date(),
				status: `You've joined the session as "${payload.username}".`,
			});
		} else {
			sessionStore({ status: `User "${payload.username}" joined.` });
		}

		sessionStore.addUser({
			id: payload.id,
			username: payload.username,
			score: 0,
		});

		sessionStore.syncScoresToGameStore();
	};

export const createSessionExistsHandler: FnTypes.CreateSessionExistsHandler =
	(sessionStore, gameStore) => () => {
		console.log(Events.SESSION_EXISTS);
		sessionStore({
			error: "Session with this ID already exists.",
			isLoading: false,
			sessionId: null,
			username: null,
			isHost: false,
			users: [],
			joinedAt: null,
			hostId: null,
			status: "Session already exists. Try another.",
		});
		gameStore.resetGame();
	};

export const createUsernameTakenHandler: FnTypes.CreateUsernameTakenHandler =
	(sessionStore, gameStore) => () => {
		console.log(Events.USERNAME_TAKEN);
		sessionStore({
			error: "Username is already taken.",
			isLoading: false,
			sessionId: null,
			username: null,
			isHost: false,
			users: [],
			joinedAt: null,
			hostId: null,
			status: "Username is already taken in this session.",
		});
		gameStore.resetGame();
	};

export const createUserLeftHandler: FnTypes.CreateUserLeftHandler =
	(sessionStore) => (payload) => {
		console.log("USER_LEFT:", payload);
		const leavingUser = sessionStore.users.find(
			(u: Types.User) => u.id === payload.userId,
		);
		sessionStore.removeUser(payload.userId);
		sessionStore({
			status: `User "${leavingUser?.username || "Unknown"}" left the session.`,
		});
		sessionStore.syncScoresToGameStore();
	};

export const createQuestionPromptHandler: FnTypes.CreateQuestionPromptHandler =
	(gameStore, sessionStore) => (payload) => {
		console.log("QUESTION_PROMPT:", payload);
		gameStore({
			currentQuestion: payload.question,
			currentQuestionIndex: payload.index,
			totalQuestions: payload.total,
			isGameStarted: true,
			isGameOver: false,
			isLoading: false,
			error: null,
			hasSubmittedAnswer: false,
		});
		sessionStore({
			status: `Question ${payload.index + 1} of ${payload.total}`,
		});
	};

export const createAnswerResultHandler: FnTypes.CreateAnswerResultHandler =
	(gameStore, sessionStore) => (payload) => {
		console.log("ANSWER_RESULT:", payload);
		gameStore.setAnswerResult(
			payload.username,
			payload.isAnswerCorrect,
			payload.answer,
		);
		sessionStore.setUsers(
			sessionStore.users.map((user) => {
				const updatedScore = payload.scores.find(
					(s) => s.username === user.username,
				);
				return updatedScore ? { ...user, score: updatedScore.score } : user;
			}),
		);
		sessionStore.syncScoresToGameStore();

		const resultMessage = payload.isAnswerCorrect
			? `${payload.username} answered correctly!`
			: `${payload.username} answered incorrectly.`;
		sessionStore({ status: resultMessage });
	};

export const createGameOverHandler: FnTypes.CreateGameOverHandler =
	(gameStore, sessionStore) => (payload) => {
		console.log("GAME_OVER:", payload);
		gameStore.setGameOver(payload.finalScores);
		sessionStore.setUsers(
			sessionStore.users.map((user) => {
				const finalScore = payload.finalScores.find(
					(s) => s.username === user.username,
				);
				return finalScore ? { ...user, score: finalScore.score } : user;
			}),
		);
		sessionStore.syncScoresToGameStore();
		sessionStore({ status: "Game Over!" });
	};

export const createSessionClosedHandler: FnTypes.CreateSessionClosedHandler =
	(gameStore, sessionStore, socketStore) => () => {
		console.log("SESSION_CLOSED");
		gameStore.resetGame();
		sessionStore.resetSession();
		socketStore({ socketState: "disconnected", isConnected: false });
		sessionStore({ status: "Session closed." });
		gameStore.setError("Session closed by host or server.");
	};

export const cleanupSocket: FnTypes.CleanupSocket = (socket, socketStore) => {
	if (socket) {
		console.log("Cleaning up socket connection...");
		socket.offAny();
		socket.disconnect();
	}
	socketStore({
		isConnected: false,
		socketState: "disconnected",
		lastError: null,
		reconnectAttempt: 0,
	});
};
