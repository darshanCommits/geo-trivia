import Star9 from "@/components/stars/s9";
import { useState, useCallback, useEffect } from "react";
import GameComponent from "@/components/game-component";
import { useNavigate } from "@tanstack/react-router";
import type { Answer } from "@shared/core.types";
import { useNextQueListener } from "@/hooks/listeners/on.game:que-recieved";
import { useTriviaStore } from "@/stores/game.store";
import { useRequestNextQuestion } from "@/hooks/ws/on.game:next-question";
import { useSubmitAnswer } from "@/hooks/ws/on.game:submit-answer";
import { LoadingPage } from "./loading";
import { useGameFinishedListener } from "@/hooks/listeners/on.game:finished";

export default function GamePage() {
	const { isLoading, subscribe } = useNextQueListener();
	const { requestNextQuestion } = useRequestNextQuestion();
	const { submitAnswer } = useSubmitAnswer();
	useGameFinishedListener();

	const setStatus = useTriviaStore((state) => state.setGameStatus);
	const sessionId = useTriviaStore((s) => s.session?.sessionId);
	const questionNumber = useTriviaStore((s) => s.questionNumber);
	const totalQuestions = useTriviaStore((s) => s.session?.totalQuestions) || 15;
	const currentQuestion = useTriviaStore((s) => s.question);
	const gameStatus = useTriviaStore((s) => s.session?.status);
	const navigate = useNavigate();

	const endGameList = useTriviaStore((s) => s.leaderboard);

	console.log("QUESTION NUMBER : ", questionNumber);
	const [score, setScore] = useState(0);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Initial question load
	useEffect(() => {
		if (sessionId && !isLoading) {
			console.warn("useEffect this is triggered");
			subscribe(); // arm the listener
			requestNextQuestion({ sessionId });
		}
	}, []);

	// Handle answer submission
	const handleAnswer = useCallback(
		async (selectedIndex: number, timeRemaining = 0) => {
			console.warn("use callback this is triggered");
			if (isSubmitting || !sessionId) return;

			setIsSubmitting(true);

			const answer: Answer = {
				questionNumber,
				selectedOption: selectedIndex,
				timeRemaining,
			};

			const res = await submitAnswer({ answer });
			if (!res.success || !res.data) {
				console.error("Failed to submit answer", res.error);
				setIsSubmitting(false);
				return;
			}

			if (res.data.correct) {
				setScore(res.data.user.score);
			}

			// Last question? then go to leaderboard
			if (questionNumber >= totalQuestions) {
				navigate({ to: "/leaderboard" });
				return;
			}

			// Fetch next question
			subscribe();
			await requestNextQuestion({ sessionId });
			setIsSubmitting(false);
		},
		[
			isSubmitting,
			sessionId,
			questionNumber,
			totalQuestions,
			submitAnswer,
			requestNextQuestion,
			navigate,
			subscribe,
		],
	);

	if (gameStatus === "finished") {
		console.log("Here is end game list");
		console.log(endGameList);
		if (!endGameList) {
			throw new Error("Leaderboard is null. should not be");
		}
		navigate({ to: "/leaderboard" });
		return null;
	}

	if (isLoading || !currentQuestion) {
		console.warn("before loading");
		console.table({
			gameStatus,
			endGameList,
		});
		return <LoadingPage />;
	}

	if (!sessionId) {
		navigate({ to: "/" });
		return null;
	}

	// need tow work on this. need a hook that handles

	return (
		<div className="bg-emerald-300 pattern-background relative">
			<Star9
				size={250}
				className="absolute top-20 left-20 text-black dark:text-blue-500"
				pathClassName="stroke-black dark:stroke-white"
				strokeWidth={2}
			/>
			<Star9
				size={250}
				className="absolute bottom-10 right-10 text-black dark:text-blue-500"
				pathClassName="stroke-black dark:stroke-white"
				strokeWidth={2}
			/>

			<GameComponent
				score={score}
				questionData={currentQuestion}
				onAnswer={handleAnswer}
				currentQuestionIndex={questionNumber}
				totalQuestions={totalQuestions}
			/>
		</div>
	);
}
