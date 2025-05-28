import { useTriviaClient } from "@/provider/trivia.provider";
import { useTriviaStore } from "@/stores/game.store";
import type { ClientEvents } from "@shared/events.types";

type RequestNextQuestionParams = ClientEvents["game:question-next"]["request"];

export function useRequestNextQuestion() {
	const client = useTriviaClient();
	const setQuestionNumber = useTriviaStore((s) => s.setQuestionNumber);
	const setQuestion = useTriviaStore((s) => s.setQuestion);

	const setStatus = useTriviaStore((state) => state.setGameStatus);
	const requestNextQuestion = async ({
		sessionId,
	}: RequestNextQuestionParams) => {
		try {
			const res = await client.request("game:question-next", {
				sessionId,
			});

			if (!res || !res.success) {
				console.error("Failed to request next question:", res?.error);
				return {
					success: false,
					error: res?.error ?? {
						reason: "unknown_error",
						message: "No response or unexpected failure.",
					},
				};
			}

			const { question, questionNumber, status } = res.data;

			// Update store
			setQuestion(question);
			setQuestionNumber(questionNumber);
			setStatus(status);

			return { success: true, data: res.data };
			// Optionally return the data if needed by the caller
		} catch (err) {
			console.error("Socket error during next question request:", err);
			return {
				success: false,
				error: {
					reason: "socket_exception",
					message: "Failed to send request due to socket error.",
				},
			};
		}
	};

	return { requestNextQuestion };
}
