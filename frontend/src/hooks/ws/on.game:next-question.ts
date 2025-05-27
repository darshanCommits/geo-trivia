import { useTriviaClient } from "@/provider/trivia.provider";
import type { ClientEvents } from "@shared/events.types";

type RequestNextQuestionParams = ClientEvents["game:question-next"]["request"];

export function useRequestNextQuestion() {
	const client = useTriviaClient();

	const requestNextQuestion = async ({
		sessionId,
		currentQuestionNumber,
	}: RequestNextQuestionParams) => {
		try {
			const res = await client.request("game:question-next", {
				sessionId,
				currentQuestionNumber,
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

			// Optionally return the data if needed by the caller
			return {
				success: true,
				data: res.data,
			};
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
