import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type QuestionPropType = {
	question: string;
	options: string[];
	correctAnswer: string;
	onAnswer: (isCorrect: boolean) => void;
};

/**
 * Question component for quiz applications
 * Displays a question with multiple choice options and handles answer selection
 */
function Question({
	question,
	options,
	correctAnswer,
	onAnswer,
}: QuestionPropType) {
	const [selectedOption, setSelectedOption] = useState<string | null>(null);
	const [isAnswered, setIsAnswered] = useState(false);

	/**
	 * Handles option selection and triggers the answer callback after a delay
	 */
	const handleOptionSelect = (option: string) => {
		if (isAnswered) return;

		const isCorrect = option === correctAnswer;

		setSelectedOption(option);
		setIsAnswered(true);

		// Show feedback for 750ms before moving to next question
		setTimeout(() => {
			onAnswer(isCorrect);
			setSelectedOption(null);
			setIsAnswered(false);
		}, 750);
	};

	/**
	 * Determines the appropriate style for each option button based on the current state
	 */
	const getOptionStyle = (option: string): string => {
		if (!isAnswered) {
			return "hover:bg-gray-200";
		}

		if (option === correctAnswer) {
			return "bg-green-500 text-white hover:bg-green-600";
		}

		if (option === selectedOption) {
			return "bg-red-500 text-white hover:bg-red-600";
		}

		return "opacity-50 cursor-not-allowed";
	};

	/**
	 * Determines if a button should be disabled
	 */
	const isOptionDisabled = (option: string): boolean => {
		return isAnswered && option !== selectedOption && option !== correctAnswer;
	};

	return (
		<div className="w-full max-w-md transition-opacity duration-300 ease-in-out opacity-100">
			<Card>
				<CardHeader>
					<CardTitle className="text-xl font-bold text-gray-800">
						{question}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<ul className="space-y-4">
						{options.map((option) => (
							<li key={option}>
								<Button
									variant="secondary"
									onClick={() => handleOptionSelect(option)}
									disabled={isOptionDisabled(option)}
									className={cn(
										"w-full py-2 rounded-lg text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300",
										getOptionStyle(option),
									)}
								>
									{option}
								</Button>
							</li>
						))}
					</ul>
				</CardContent>
			</Card>
		</div>
	);
}

export default Question;
