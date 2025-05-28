import { useState } from "react";
import { useTriviaClient } from "@/provider/trivia.provider";
import { useTriviaStore } from "@/stores/game.store";
import type { Answer } from "@shared/core.types";

export function useSubmitAnswer() {
	const client = useTriviaClient();
	const sessionId = useTriviaStore((s) => s.session?.sessionId);
	const username = useTriviaStore((s) => s.user?.username);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const submitAnswer = async ({
		answer,
	}: {
		username: string;
		answer: Answer;
	}) => {
		setError(null);
		setIsLoading(true);

		try {
			if (!sessionId || !username) {
				return;
			}

			const response = await client.request("game:answer", {
				sessionId,
				username,
				answer,
			});

			if (!response.success) {
				setError(response.error?.message ?? "Failed to submit answer");
				setIsLoading(false);
				return response.error;
			}

			setIsLoading(false);
			return response.data; // { isCorrect, user }
		} catch (err) {
			setError("Network error occurred");
			setIsLoading(false);
			return false;
		}
	};

	const clearError = () => setError(null);

	return { submitAnswer, error, isLoading, clearError };
}
