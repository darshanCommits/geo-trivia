import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { accentColors } from "@/lib/colors";
import type { QuestionType } from "@shared/types";
import { useEffect, useState } from "react";

const rotationClass = (index: number) => {
	const rotations = [-1, 1, 1, -1].map((rot) => {
		if (rot < 0) {
			return `-rotate-${Math.abs(rot)}`;
		}
		return `rotate-${rot}`;
	});

	return rotations[index];
};

const bgAccent = (index: number) => {
	const color = accentColors.map((x) => `bg-${x}`);

	return color[index];
};

const Option = ({
	onAnswer,
	className,
	index,
	text,
	isDisabled,
}: {
	isDisabled: boolean;
	onAnswer: (answer: number) => void;
	className: string;
	index: number; // this is option number
	text: string;
}) => {
	return (
		<Button
			disabled={isDisabled}
			onClick={() => onAnswer(index)}
			className={`text-2xl relative w-full h-auto min-h-16 transition-all duration-300 ${className}`}
		>
			<span className="absolute -top-2 -left-2 w-6 h-6 flex items-center justify-center rounded-full bg-white text-black border-2 border-black text-sm font-bold">
				{String.fromCharCode(65 + index)}
			</span>
			<div className="w-full whitespace-normal text-left px-2">{text}</div>
		</Button>
	);
};

export const QuestionCard = ({
	questionData,
	onAnswer,
	currentQuestionIndex,
	className,
}: {
	onAnswer: (answer: number) => void;
	questionData: QuestionType;
	currentQuestionIndex: number;
	className?: string;
}) => {
	const [scrambledOptions, setScrambledOptions] = useState<string[]>([]);
	const [isScrambled, setIsScrambled] = useState(true);

	// Function to shuffle the characters in a string
	const shuffleString = (str: string): string => {
		const arr = str.toLowerCase().replace(/\s/g, "").split(""); // remove all whitespace

		for (let i = arr.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[arr[i], arr[j]] = [arr[j], arr[i]]; // Swap elements
		}
		return arr.join("");
	};

	// biome-ignore lint/correctness/useExhaustiveDependencies: pta ni kyu de rha hai
	useEffect(() => {
		setScrambledOptions(questionData.options.map(shuffleString));
		setIsScrambled(true);

		const timer = setTimeout(() => {
			setIsScrambled(false);
		}, 0);

		return () => clearTimeout(timer);
	}, [questionData.options]);

	return (
		<Card
			className={`${className} p-4 bg-white border-4 relative shadow-shadow-thick`}
		>
			<span className="absolute -top-4 -left-4 w-10 h-10 flex items-center justify-center rounded-full bg-green text-black border border-black text-xl font-bold shadow-shadow -rotate-[9deg]">
				{currentQuestionIndex}
			</span>
			<span className="absolute -top-4 -right-4 w-10 h-10 flex items-center justify-center rounded-full bg-red text-black border border-black text-xl font-bold shadow-shadow rotate-[9deg]">
				{questionData.timeout}
			</span>
			<CardContent className="my-4">
				<h2 className="text-4xl font-semibold mb-8">{questionData.question}</h2>
				<div className="grid sm:grid-cols-2 gap-5">
					{scrambledOptions.map((text, index) => {
						// If 3 seconds have passed, show the correct option text
						const displayText = isScrambled
							? text
							: questionData.options[index];

						return (
							<Option
								isDisabled={isScrambled}
								className={`${rotationClass(index)} ${bgAccent(index)} ${
									isScrambled
										? "line-through "
										: "opacity-100 no-underline"
								} `}
								key={String.fromCharCode(index + 65)}
								index={index}
								text={displayText}
								onAnswer={(answer) => {
									if (isScrambled) return;
									onAnswer(answer);
								}}
							/>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
};
