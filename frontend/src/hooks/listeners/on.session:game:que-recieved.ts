import { useEffect } from "react";
import { useTriviaClient } from "@/provider/trivia.provider";
import { useTriviaStore } from "@/stores/game.store";
import type { ServerEvents } from "@shared/events.types";

export function useNextQueListener() {
	const client = useTriviaClient();
	const setQuestion = useTriviaStore((state) => state.setQuestion);

	const setQuestionNumber = useTriviaStore((state) => state.setQuestionNumber);

	const handler = (data: ServerEvents["game:question-recieved"]) => {
		setQuestion(data.question);
		setQuestionNumber(data.questionNumber);
	};

	useEffect(() => {
		client.on("game:question-recieved", () => handler);

		return () => {
			client.off("game:question-recieved", handler);
		};
	}, [client, setQuestion, setQuestionNumber]);
}
