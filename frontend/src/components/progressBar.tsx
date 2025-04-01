import { Progress } from "./ui/progress";

export default function ProgressBar({
	progress,
	currentQuestion,
	totalQuestions,
}: { progress: number; totalQuestions: number | '?'; currentQuestion: number }) {
	return (
		<div className="mb-6">
			<div className="flex justify-between items-center mb-2">
				<span className="text-sm font-medium text-gray-600">
					Question {currentQuestion} of {totalQuestions}
				</span>
				<span className="text-sm font-medium text-gray-600">
					Progress: {progress}%
				</span>
			</div>
			<Progress value={progress} className="h-2 bg-gray-200" />
		</div>
	);
}
