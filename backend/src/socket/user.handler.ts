import type { Socket, Server as SocketIOServer } from "socket.io";
import type { SessionData } from "./types";

export function registerUserHandlers(
	socket: Socket,
	sessions: Map<string, SessionData>,
	io: SocketIOServer,
) {
	socket.on("disconnect", () => {
		const { sessionId } = socket.data;
		if (!sessionId) return;

		const session = sessions.get(sessionId);
		if (!session) return;

		session.users = session.users.filter((u) => u.id !== socket.id);
		socket.to(sessionId).emit("user_left", { userId: socket.id });

		if (session.hostId === socket.id || session.users.length === 0) {
			sessions.delete(sessionId);
			socket.to(sessionId).emit("session_closed");
			console.warn(`Session ${sessionId} closed on disconnect`);
		}
	});

	socket.on("leave_session", () => {
		const { sessionId } = socket.data;
		if (!sessionId) return;

		const session = sessions.get(sessionId);
		if (!session) return;

		session.users = session.users.filter((u) => u.id !== socket.id);
		socket.to(sessionId).emit("user_left", { userId: socket.id });

		if (session.hostId === socket.id || session.users.length === 0) {
			sessions.delete(sessionId);
			socket.to(sessionId).emit("session_closed");
			console.log(`Session ${sessionId} closed`);
		}

		socket.data.sessionId = undefined;
		socket.data.username = undefined;
	});

	socket.on("submit_answer", ({ sessionId, answer }) => {
		const session = sessions.get(sessionId);

		if (!session || session.answered) return;

		const que = session.questions[session.currentQuestionIndex];
		const isAnswerCorrect = que.correctAnswer === answer;

		session.answered = true;

		const user = session.users.find((u) => u.id === socket.id);
		if (!user) return;

		if (isAnswerCorrect) {
			user.score += 1;
		}

		io.to(sessionId).emit("answer_result", {
			username: user.username,
			isAnswerCorrect,
			answer,
			scores: session.users.map((u) => ({
				username: u.username,
				score: u.score,
			})),
		});

		setTimeout(() => advanceToNextQuestion(sessionId), 3000);
	});

	// helper functions

	function advanceToNextQuestion(sessionId: string) {
		const session = sessions.get(sessionId);
		if (!session) return;

		session.currentQuestionIndex++;
		session.answered = false;

		if (session.currentQuestionIndex >= session.questions.length) {
			io.to(sessionId).emit("game_over", {
				finalScores: session.users.map((u) => ({
					username: u.username,
					score: u.score,
				})),
			});
			sessions.delete(sessionId);
			console.log(`Game over for session ${sessionId}`);
		} else {
			const nextQue = session.questions[session.currentQuestionIndex];
			io.to(sessionId).emit("question_prompt", {
				question: nextQue,
				index: session.currentQuestionIndex,
				total: session.questions.length,
			});
			console.log(
				`Advancing to question ${session.currentQuestionIndex} for session ${sessionId}`,
			);
		}
	}
}
