import type {
	GameSession,
	Leaderboard,
	Question,
	User,
} from "@shared/core.types";
import { server } from "../http.server";
import { TriviaGameServer } from "./TriviaGameServer";
import { generateSessionId } from "@backend/utils/lib";
import {
	fetchMockQuestions,
	fetchQuestions,
} from "@backend/services/question.service";
import type { ClientResponseWithError } from "@shared/events.types";

export const gameServer = new TriviaGameServer(server);

gameServer.handle("session:create", async (data, socket) => {
	const user: User = {
		username: data.username,
		score: 0,
	};

	const session: GameSession = {
		currentQuestionNumber: 0,
		sessionId: generateSessionId(),
		hostUsername: user.username,
		status: "waiting",
		users: [user],
		eventLockState: "CAN_REQUEST_QUESTION",
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
	const { sessionId, region } = data;
	const session = gameServer.sessions.get(sessionId);
	if (!session) {
		return {
			success: false,
			error: {
				reason: "session_not_found",
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
	// comment this while debugging
	// if (session.users.length < 2) {
	// 	return {
	// 		success: false,
	// 		error: {
	// 			reason: "insufficient_players",
	// 			message: "At least 2 players are required to start the game.",
	// 		},
	// 	};
	// }
	let questions: Question[] = [];
	try {
		// const response = await fetchQuestions(region, 10);
		const response = await fetchMockQuestions();
		questions = response;
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
	session.totalQuestions = questions.length;
	// session.currentQuestion = 0;
	gameServer.sessions.set(sessionId, session);
	gameServer.activeGameQuestions.set(sessionId, questions);

	// Broadcast game started event to ALL clients in the session
	const gameStartedData = {
		sessionId,
		status: session.status as "active",
		totalQuestions: questions.length,
		region,
		timestamp: new Date().toISOString(),
	};

	gameServer.broadcastToSession(sessionId, "game:started", gameStartedData);

	// Return success response to the host
	return {
		success: true,
		data: {
			status: "active",
			totalQuestions: questions.length,
		},
	};
});

// gameServer.handle("game:question-next", async (data, _socket) => {
gameServer.handle(
	"game:question-next",
	async (
		data,
		_socket,
	): Promise<ClientResponseWithError<"game:question-next">> => {
		const { sessionId } = data;
		const session = gameServer.sessions.get(sessionId);

		if (!session) {
			console.error(`Session not found: ${sessionId}`);
			return {
				success: false,
				error: {
					reason: "session_not_found",
					message: "Session does not exist.",
				},
			};
		}

		if (session.status !== "active") {
			console.error(
				`Session ${sessionId} is not active. Status: ${session.status}`,
			);
			return {
				success: false,
				error: {
					reason: "session_not_active",
					message: `Session is not active. Current status: ${session.status}`,
				},
			};
		}

		// Enforce event order
		if (session.eventLockState !== "CAN_REQUEST_QUESTION") {
			console.error(
				`Invalid event order for session ${sessionId}: Tried game:question-next when ${session.eventLockState} was expected.`,
			);
			return {
				success: false,
				error: {
					reason: "invalid_event_order",
					message:
						"Cannot request a new question at this time. Awaiting an answer or game is in an invalid state.",
				},
			};
		}

		// Initialize or retrieve the question index from session state
		// currentQuestionNumber should already be initialized to 0 when session starts
		if (typeof session.currentQuestionNumber !== "number") {
			session.currentQuestionNumber = 0; // Fallback, but should be set at session creation
		}

		const idx = session.currentQuestionNumber;
		const questions = gameServer.activeGameQuestions.get(sessionId) || [];
		const totalQuestions = questions.length;

		if (idx >= totalQuestions) {
			console.log(`Session ${sessionId} has reached the end of questions.`);
			session.status = "finished"; // Mark session as completed
			// gameServer.sessions.set(sessionId, session); // Ensure map is updated if session objects are not references
			//

			const leaderboard: Leaderboard = session.users
				.sort((a, b) => b.score - a.score)
				.map((user, index) => ({
					...user,
					rank: index + 1,
				}));
			// Optionally, broadcast a game over event
			gameServer.broadcastToSession(sessionId, "game:finished", {
				leaderboard,
				status: "finished",
			});

			return {
				success: true,
				data: {
					question: null,
					questionNumber: idx,
					status: "finished",
				},
			};
		}

		// should never happen
		if (idx < 0) {
			console.error(`Invalid question index ${idx} for session ${sessionId}`);
			return {
				success: false,
				error: {
					reason: "invalid_question_number",
					message: `Invalid question number: ${idx}.`,
				},
			};
		}

		const { correctAnswer, ...questionToSend } = questions[idx];

		gameServer.broadcastToSession(sessionId, "game:question-recieved", {
			question: questionToSend,
			questionNumber: idx,
		});

		session.eventLockState = "CAN_SUBMIT_ANSWER";
		session.currentQuestionNumber = idx + 1;

		// gameServer.sessions.set(sessionId, session); // Ensure map is updated if session objects are not references

		return {
			success: true,
			data: {
				question: questionToSend,
				questionNumber: idx, // Changed from currentQuestionNumber to idx for clarity
				status: "active",
			},
		};
	},
);

// gameServer.handle("game:answer", async (data, _socket) => {
gameServer.handle("game:answer", async (data, _socket) => {
	const { sessionId, username, answer } = data;
	const { questionNumber, selectedOption, timeRemaining } = answer;

	const session = gameServer.sessions.get(sessionId);

	if (!session) {
		console.error(`Session not found: ${sessionId}`);
		return {
			success: false,
			error: {
				reason: "session_not_found",
				message: "Session does not exist.",
			},
		};
	}

	if (session.status !== "active") {
		console.error(
			`Session ${sessionId} is not active for answer. Status: ${session.status}`,
		);
		return {
			success: false,
			error: {
				reason: "session_not_active",
				message: `Session is not active. Current status: ${session.status}`,
			},
		};
	}

	// Enforce event order
	// if (session.eventLockState !== "CAN_SUBMIT_ANSWER") {
	// 	console.error(
	// 		`Invalid event order for session ${sessionId}: Tried game:answer when ${session.eventLockState} was expected.`,
	// 	);
	// 	return {
	// 		success: false,
	// 		error: {
	// 			reason: "invalid_event_order",
	// 			message:
	// 				"Cannot submit an answer at this time. No question is currently pending an answer.",
	// 		},
	// 	};
	// }

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

	// The question that was sent out and is awaiting an answer is at index `session.currentQuestionNumber - 1`
	// because session.currentQuestionNumber was already incremented to point to the *next* question.
	const expectedQuestionNumber = session.currentQuestionNumber - 1;

	if (questionNumber !== expectedQuestionNumber) {
		console.error(
			`Answer for wrong question in session ${sessionId}. Expected: ${expectedQuestionNumber}, Got: ${questionNumber}`,
		);
		return {
			success: false,
			error: {
				reason: "wrong_Youtubeed",
				message: `Answer submitted for an outdated or incorrect question. Expected question number ${expectedQuestionNumber}.`,
			},
		};
	}

	const question = questions[questionNumber]; // or questions[expectedQuestionNumber]
	if (!question) {
		return {
			success: false,
			error: {
				reason: "question_not_found",
				message: "Question data not found for the submitted answer.",
			},
		};
	}

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

	const isCorrect = question.correctAnswer === selectedOption;
	if (isCorrect) {
		const baseScore = 10;
		const bonus = Math.floor(timeRemaining / 2);
		user.score += baseScore + bonus;
	}

	// All checks passed, answer processed. Update session state.
	session.eventLockState = "CAN_REQUEST_QUESTION";
	// gameServer.sessions.set(sessionId, session); // Ensure map is updated

	return {
		success: true,
		data: {
			correct: isCorrect,
			user, // Send back the updated user object with new score
			correctAnswer: question.correctAnswer, // Useful for client to show correct answer
			questionNumber: questionNumber,
		},
	};
});
