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

	socket.on(Events.SUBMIT_ANSWER, ({ sessionId, answer }) => {
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
	});
}
