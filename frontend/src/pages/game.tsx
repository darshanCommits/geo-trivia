import Star9 from "@/components/stars/s9";
import type { QuestionType } from "@shared/types";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/spinner";
import {  fetchMockQue } from "@/lib/fetchMockQue";
import GameComponent from "@/components/game-component";

async function fetchQuestions() {
	const res = await fetch("http://localhost:3000/api/questions/init", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			city: "Udaipur",
			queCount: 5,
		}),
	});

	if (!res.ok) {
		const err = await res.json();
		throw new Error(err.error ?? "Failed to fetch questions");
	}

	return res.json();
}

export default function GamePage() {
	const [score, setScore] = useState(0);
	const [questionIndex, setQuestionIndex] = useState(0);
	const {
		data: questions,
		isLoading,
		error,
	} = useQuery<QuestionType[]>({
		queryKey: ["questions"],
		queryFn: fetchMockQue,
	});

	function handleAnswer(selectedIndex: number) {
		if (!questions) return;

		const currentQuestion = questions[questionIndex];
		if (selectedIndex === currentQuestion.correctAnswer) {
			setScore((prev) => prev + 1);
		}

		setQuestionIndex((prev) => prev + 1);
	}

	if (error || !questions) return <div>Error loading questions</div>;

	const currentQuestion = questions[questionIndex];

	if (!currentQuestion) {
		return <div>No more questions!</div>;
	}

	return (
		<div className="bg-emerald-200 pattern-background relative">
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

			{isLoading ? (
				<Spinner />
			) : (
				<GameComponent
					score={score}
					questionData={currentQuestion}
					onAnswer={handleAnswer}
					currentQuestionIndex={questionIndex + 1}
					totalQuestions={15}
				/>
			)}
		</div>
	);
}
