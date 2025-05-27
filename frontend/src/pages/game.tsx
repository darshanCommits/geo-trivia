import Star9 from "@/components/stars/s9";
import { useState, useCallback } from "react";
import GameComponent from "@/components/game-component";
import { useNavigate } from "@tanstack/react-router";
import type { Answer } from "@shared/core.types";
import { useNextQueListener } from "@/hooks/listeners/on.session:game:que-recieved";
import { useTriviaStore } from "@/stores/game.store";
import { useRequestNextQuestion } from "@/hooks/ws/on.game:next-question";
import { useSubmitAnswer } from "@/hooks/ws/on.game:submit-answer";

export default function GamePage() {
	useNextQueListener();

	const { requestNextQuestion } = useRequestNextQuestion();
	const { submitAnswer } = useSubmitAnswer();

	const sessionId = useTriviaStore((s) => s.session?.sessionId);
	const questionNumber = useTriviaStore((s) => s.questionNumber);
	const totalQuestions = useTriviaStore((s) => s.session?.totalQuestions) || 10;
	const currentQuestion = useTriviaStore((s) => s.question);

	const navigate = useNavigate();
	const [score, setScore] = useState(0);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Handle answer submission - wrapper to convert selectedIndex to Answer type
	const handleAnswer = useCallback(
		async (selectedIndex: number, timeRemaining = 0) => {
			if (isSubmitting || !sessionId) return;

			setIsSubmitting(true);

			// Create Answer object from selectedIndex
			const answer: Answer = {
				questionNumber,
				selectedOption: selectedIndex,
				timeRemaining,
			};

			try {
				const result = await submitAnswer({ answer });

				if (result.success && result.data) {
					// Update score if answer was correct
					if (result.data.correct) {
						setScore((prevScore) => prevScore + 1);
					}

					// Check if this was the last question
					if (questionNumber >= totalQuestions) {
						// Game is complete, navigate to leaderboard
						navigate({ to: "/leaderboard" });
						return;
					}

					// Request next question
					const nextQuestionResult = await requestNextQuestion({
						sessionId,
						currentQuestionNumber: questionNumber,
					});

					if (!nextQuestionResult.success) {
						console.error(
							"Failed to get next question:",
							nextQuestionResult.error,
						);
						// Optionally handle error (show toast, etc.)
					}
				} else {
					console.error("Failed to submit answer:", result.error);
					// Optionally handle error (show toast, etc.)
				}
			} catch (error) {
				console.error("Unexpected error during answer submission:", error);
			} finally {
				setIsSubmitting(false);
			}
		},
		[
			isSubmitting,
			sessionId,
			submitAnswer,
			questionNumber,
			totalQuestions,
			requestNextQuestion,
			navigate,
		],
	);

	// Redirect if no current question
	if (!currentQuestion) {
		navigate({ to: "/leaderboard" });
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
				currentQuestionIndex={questionNumber}
				totalQuestions={totalQuestions}
			/>
		</div>
	);
}
