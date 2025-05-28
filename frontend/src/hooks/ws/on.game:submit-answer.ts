import { useTriviaClient } from "@/provider/trivia.provider";
import { useTriviaStore } from "@/stores/game.store";
import type { Answer } from "@shared/core.types";

export function useSubmitAnswer() {
	const client = useTriviaClient();
	const sessionId = useTriviaStore((s) => s.session?.sessionId);
	const username = useTriviaStore((s) => s.user?.username);

	const submitAnswer = async ({
		answer,
	}: {
		answer: Answer;
	}) => {
		console.log("📤 submitting answer hook fired", {
			answer,
			sessionId,
			username,
		});
		try {
			const res = await client.request("game:answer", {
				sessionId: sessionId,
				username,
				answer,
			});

			console.log("triggered game:answer from client");
			console.log("here is output");
			console.table(res);

			console.log(res);

			if (!res || !res.success) {
				console.error("Failed to submit answer:", res?.error);
				return {
					success: false,
					error: res?.error ?? {
						reason: "unknown_error",
						message: "No response or unexpected failure.",
					},
				};
			}

			return {
				success: true,
				data: res.data, // { correct: boolean; user: User }
			};
		} catch (error) {
			console.error("Socket error submitting answer:", error);
			return {
				success: false,
				error: {
					reason: "socket_exception",
					message: "Failed to send answer due to socket error.",
				},
			};
		}
	};

	return { submitAnswer };
}
