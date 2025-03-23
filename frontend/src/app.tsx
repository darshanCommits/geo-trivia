import type { QuestionType } from "%/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import Question from "./Question";

/**
 * Main Trivia Game application component
 */
function App() {
	const [questions, setQuestions] = useState<QuestionType[]>([]);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [score, setScore] = useState(0);
	const [gameOver, setGameOver] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		(async () => {
			try {
				setIsLoading(true);
				const response = await fetch("http://localhost:3000");
				const data: QuestionType[] = await response.json();
				setQuestions(data);
			} catch (error) {
				console.error("Error loading questions:", error);
			} finally {
				setIsLoading(false);
			}
		})();
	}, []);

	/**
	 * Handles player's answer, updates score, and moves to next question
	 */
	const handleAnswer = (isCorrect: boolean): void => {
		if (isCorrect) {
			setScore((prevScore) => prevScore + 1);
		}

		const nextQuestionIndex = currentQuestionIndex + 1;
		if (nextQuestionIndex < questions.length) {
			setCurrentQuestionIndex(nextQuestionIndex);
		} else {
			setGameOver(true);
		}
	};

	/**
	 * Resets the game state to start a new game
	 */
	const resetGame = (): void => {
		setCurrentQuestionIndex(0);
		setScore(0);
		setGameOver(false);
	};

	/**
	 * Calculates current progress percentage
	 */
	const calculateProgress = (): number => {
		return Math.round((currentQuestionIndex / questions.length) * 100);
	};

	// Loading state
	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gray-50 ">
				<div className="text-center">
					<div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4">
						<p className="text-xl font-medium text-gray-700">
							Loading questions...
						</p>
					</div>
				</div>
			</div>
		);
	}

	// Game Over state
	if (gameOver) {
		const percentage = Math.round((score / questions.length) * 100);
		let message = "Good effort!";

		if (percentage >= 80) {
			message = "Excellent work!";
		} else if (percentage >= 50) {
			message = "Well done!";
		}

		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
				<Card className="w-full max-w-md shadow-xl border-0">
					<CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
						<CardTitle className="text-3xl font-bold text-center">
							Game Over!
						</CardTitle>
					</CardHeader>
					<CardContent className="pt-6 pb-8 px-8">
						<div className="text-center space-y-6">
							<div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-100 mb-4">
								<span className="text-3xl font-bold text-blue-600">
									{percentage}%
								</span>
							</div>

							<div className="space-y-2">
								<h3 className="text-2xl font-semibold text-gray-800">
									{message}
								</h3>
								<p className="text-lg text-gray-600">
									You scored{" "}
									<span className="font-bold text-blue-600">{score}</span> out
									of <span className="font-bold">{questions.length}</span>
								</p>
							</div>

							<Button
								onClick={resetGame}
								className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium px-8 py-2 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl"
							>
								Play Again
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	// Active game state
	const currentQuestion = questions[currentQuestionIndex];
	const correctAns = currentQuestion.options[currentQuestion.correctAnswer];

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-10 px-4">
			<div className="max-w-4xl mx-auto">
				<header className="text-center mb-8">
					<h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
						Trivia Challenge
					</h1>
					<p className="text-gray-600">
						Test your knowledge with these challenging questions!
					</p>
				</header>

				<div className="mb-6">
					<div className="flex justify-between items-center mb-2">
						<span className="text-sm font-medium text-gray-600">
							Question {currentQuestionIndex + 1} of {questions.length}
						</span>
						<span className="text-sm font-medium text-gray-600">
							Progress: {calculateProgress()}%
						</span>
					</div>
					<Progress value={calculateProgress()} className="h-2 bg-gray-200" />
				</div>

				<div className="flex flex-col items-center space-y-8">
					<Question
						question={currentQuestion.question}
						options={currentQuestion.options}
						correctAnswer={correctAns}
						onAnswer={handleAnswer}
					/>
				</div>
			</div>
		</div>
	);
}

export default App;
