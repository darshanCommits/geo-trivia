import { QuestionCard } from "@/components/ui/QuestionCard";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Title from "@/components/ui/title-header";
import type { QuestionType } from "@shared/types";

GameComponent.defaultProps = {
	total: 15,
	timeout: 15,
};

export default function GameComponent(props: {
	totalQuestions: number;
	currentQuestionIndex: number;
	onAnswer: (answer: number) => void;
	questionData: QuestionType;
	score: number;
}) {
	return (
		<div className="container mx-auto h-screen flex flex-col items-center justify-center gap-8 p-4 ">
			<Title className="fixed top-10  z-50" />

			<div className="flex flex-col gap-8 container items-center pt-16">
				<ScoreBoard score={props.score} currentMax={0} />
				<QuestionCard
					className="w-3xl h-3xl"
					questionData={props.questionData}
					onAnswer={props.onAnswer}
					currentQuestionIndex={props.currentQuestionIndex}
				/>

				<Progress
					className="w-full max-w-3xl"
					total={props.totalQuestions}
					value={progressFormula(
						props.currentQuestionIndex,
						props.totalQuestions,
					)}
				/>
			</div>
		</div>
	);
}

function ScoreBoard(props: {
	score: number;
	currentMax: number;
}) {
	return (
		<div className="w-full max-w-3xl flex justify-between">
			<Badge className="rotate-2 bg-cyan h-16 px-12 text-2xl hover:none">
				Score : {props.score}
			</Badge>
			<Badge className="-rotate-2 bg-purple h-16 px-12 text-2xl">
				High Score : {props.currentMax}
			</Badge>
		</div>
	);
}
function progressFormula(current: number, total: number): number {
	// to get that *slightly* above neobrutalism look
	const res = Math.min((current / total) * 100 + 1, 100);
	return res;
}
