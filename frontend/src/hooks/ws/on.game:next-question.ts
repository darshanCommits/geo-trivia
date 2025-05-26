import { useState } from "react";
import { useTriviaClient } from "@/provider/trivia.provider";
import { useTriviaStore } from "@/stores/game.store";
import type { ClientResponseWithError } from "@shared/events.types";

export function useNextQuestion() {
	const client = useTriviaClient();
	const addQuestion = useTriviaStore((s) => s.addQuestion); // assuming you have this action to store questions in client state
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	const fetchNextQuestion = async (
		sessionId: string,
		currentQuestionNumber: number,
	): Promise<boolean> => {
		setError(null);
		setIsLoading(true);

		try {
			const response: ClientResponseWithError<"game:question-next"> =
				await client.request("game:question-next", {
					sessionId,
					currentQuestionNumber,
				});

			if (response.success) {
				addQuestion(response.data.question, response.data.questionNumber);
				setIsLoading(false);
				return true;
			}

			setError(response.error?.message ?? "Failed to fetch question");
			setIsLoading(false);
			return false;
		} catch (err) {
			setError("Network error occurred");
			setIsLoading(false);
			return false;
		}
	};

	const clearError = () => setError(null);

	return { fetchNextQuestion, error, isLoading, clearError };
}
