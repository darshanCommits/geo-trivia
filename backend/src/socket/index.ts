import type { GameSession, Question, User } from "@shared/core.types";
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

gameServer.handle("game:start", async (data, socket) => {
	const { sessionId } = data;
	const session = gameServer.sessions.get(sessionId);

	if (!session) {
		return {
			success: false,
			error: {
				reason: "game_already_started",
				message: "Session not found or already removed.",
			},
		};
	}

	const socketData = socket.data;
	if (!socketData?.user || !socketData?.session) {
		return {
			success: false,
			error: {
				reason: "only_host_can_start",
				message: "Invalid session context.",
			},
		};
	}

	if (socketData.user.username !== session.hostUsername) {
		return {
			success: false,
			error: {
				reason: "only_host_can_start",
				message: "Only the host can start the game.",
			},
		};
	}

	if (session.status === "active") {
		return {
			success: false,
			error: {
				reason: "game_already_started",
				message: "Game has already started.",
			},
		};
	}

	if (session.users.length < 2) {
		return {
			success: false,
			error: {
				reason: "insufficient_players",
				message: "At least 2 players are required to start the game.",
			},
		};
	}

	let questions: Question[] = [];
	try {
		const response = await fetch("http://localhost:3000/api/questions/init");
		questions = await response.json();
	} catch (err) {
		console.error("Failed to fetch questions:", err);
		return {
			success: false,
			error: {
				reason: "unable_to_fetch_question",
				message: "Unable to fetch questions. Please try again.",
			},
		};
	}

	// Update state
	session.status = "active";
	gameServer.sessions.set(sessionId, session);
	gameServer.activeGameQuestions.set(sessionId, questions);

	// Only notify the host to begin sending questions
	return {
		success: true,
		data: {
			status: "active",
			totalQuestions: questions.length,
		},
	};
});

gameServer.handle("game:question-next", async (data, _socket) => {
	const { sessionId, currentQuestionNumber } = data;
	const session = gameServer.sessions.get(sessionId);

	if (!session || session.status !== "active") {
		return {
			success: false,
			error: {
				reason: "session_not_found",
				message: "Session is not active or does not exist.",
			},
		};
	}

	const questions = gameServer.activeGameQuestions.get(sessionId) || [];
	const totalQuestions = questions.length;

	if (currentQuestionNumber < 1 || currentQuestionNumber > totalQuestions) {
		return {
			success: false,
			error: {
				reason: "invalid_question_number",
				message: "Invalid question number.",
			},
		};
	}

	const question = questions[currentQuestionNumber];
	if (!question) {
		return {
			success: false,
			error: {
				reason: "question_not_found",
				message: "Question not found.",
			},
		};
	}

	const { correctAnswer, ...questionToSend } = question;

	gameServer.broadcastToSession(sessionId, "game:question-recieved", {
		question: questionToSend,
		questionNumber: currentQuestionNumber,
	});

	return {
		success: true,
		data: {
			question: questionToSend,
			questionNumber: currentQuestionNumber,
		},
	};
});

gameServer.handle("game:answer", async (data, _socket) => {
	const { sessionId, username, answer } = data;
	const { questionNumber, selectedOption, timeRemaining } = answer;

	// Find the session the user belongs to
	const session = gameServer.sessions.get(sessionId);
	if (!session || session.status !== "active") {
		return {
			success: false,
			error: {
				reason: "session_not_found",
				message: "Session is not active or does not exist.",
			},
		};
	}

	const questions = gameServer.activeGameQuestions.get(sessionId);
	if (!questions) {
		return {
			success: false,
			error: {
				reason: "no_questions",
				message: "No questions found for the session.",
			},
		};
	}

	const question = questions[questionNumber];
	if (!question) {
		return {
			success: false,
			error: {
				reason: "question_not_found",
				message: "Question not found.",
			},
		};
	}

	const isCorrect = question.correctAnswer === selectedOption;

	const user = session.users.find((u) => u.username === username);
	if (!user) {
		return {
			success: false,
			error: {
				reason: "user_not_found",
				message: "User not found in session.",
			},
		};
	}

	// Scoring logic (example: +10 points if correct, bonus for fast answers)
	if (isCorrect) {
		const baseScore = 10;
		const bonus = Math.floor(timeRemaining / 2); // example: 0.5 point per second left
		user.score += baseScore + bonus;
	}

	// Return updated user and correctness
	return {
		success: true,
		data: {
			correct: isCorrect,
			user,
		},
	};
});
