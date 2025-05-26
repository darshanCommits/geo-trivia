import Star9 from "@/components/stars/s9";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import GameComponent from "@/components/game-component";
import { useNavigate } from "@tanstack/react-router";
import { LoadingPage } from "@/pages/loading";
import { ErrorPage } from "@/pages/error";

import fetchQuestions from "@/lib/fetchQuestions";
import type { Question } from "@shared/core.types";
// import { fetchQuestions } from "@/lib/fetchMockQue";

export default function GamePage() {
	const navigate = useNavigate();
	const [score, setScore] = useState(0);
	const [questionIndex, setQuestionIndex] = useState(0);

	const {
		data: questions,
		isLoading,
		error,
	} = useQuery<Question[]>({
		queryKey: ["questions"],
		queryFn: fetchQuestions,
		retry: 2,
		refetchOnWindowFocus: false,
	});

	function handleAnswer(selectedIndex: number) {
		if (!questions) return;
		const currentQuestion = questions[questionIndex];
		if (selectedIndex === currentQuestion.correctAnswer) {
			setScore((prev) => prev + 1);
		}

		if (questionIndex + 1 >= questions.length) {
			navigate({
				to: "/leaderboard",
				search: {
					finalScore:
						score + (selectedIndex === currentQuestion.correctAnswer ? 1 : 0),
				},
			});
		} else {
			setQuestionIndex((prev) => prev + 1);
		}
	}

	if (isLoading) {
		return <LoadingPage />;
	}

	if (error) {
		const err =
			error instanceof Error ? error : new Error("An unknown error occurred");

		return <ErrorPage error={err} />;
	}

	if (!questions || questions.length === 0) {
		return <ErrorPage error={new Error("No questions available")} />;
	}

	const currentQuestion = questions[questionIndex];

	if (!currentQuestion) {
		navigate({
			to: "/leaderboard",
		});
		return null;
	}

	return (
		<div className="bg-emerald-300 pattern-background relative">
			<Star9
				size={250}
				className="text-black dark:text-blue-500 absolute top-20 left-20"
				pathClassName="stroke-black dark:stroke-white"
				strokeWidth={2}
			/>
			<Star9
				size={250}
				className="text-black dark:text-blue-500 absolute bottom-10 right-10"
				pathClassName="stroke-black dark:stroke-white"
				strokeWidth={2}
			/>
			<GameComponent
				score={score}
				questionData={currentQuestion}
				onAnswer={handleAnswer}
				currentQuestionIndex={questionIndex + 1}
				totalQuestions={questions.length}
			/>
		</div>
	);
}
