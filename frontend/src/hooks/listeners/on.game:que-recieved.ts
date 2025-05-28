// hooks/listeners/on.game:que-recieved.ts
import { useTriviaClient } from "@/provider/trivia.provider";
import { useTriviaStore } from "@/stores/game.store";
import { useCallback, useEffect, useState } from "react";
import type { ServerEvents } from "@shared/events.types";

export function useNextQueListener() {
	const client = useTriviaClient();
	const setQuestion = useTriviaStore((s) => s.setQuestion);
	const setQuestionNum = useTriviaStore((s) => s.setQuestionNumber);

	// When true, we are waiting for the next question
	const [isLoading, setIsLoading] = useState(true);

	const subscribe = useCallback(() => {
		setIsLoading(true);
	}, []);

	useEffect(() => {
		if (!isLoading) return;

		const handler = (data: ServerEvents["game:question-recieved"]) => {
			console.table(data);
			setQuestion(data.question);
			setQuestionNum(data.questionNumber);
			setIsLoading(false);
		};

		client.on("game:question-recieved", handler);
		return () => {
			client.off("game:question-recieved", handler);
		};
	}, [client, isLoading, setQuestion, setQuestionNum]);

	return { isLoading, subscribe };
}
