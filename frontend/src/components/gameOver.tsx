import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { gameOverMsg } from "@/lib/utils";

type GameOverProp = {
	score: number;
	totalQuestions: number;
	resetGame: () => void;
};

export default function GameOver({ score, totalQuestions: maxScore, resetGame }: GameOverProp) {
	console.log("ye bhi kr rha hai");
	const percentage = Math.round((score / maxScore) * 100);
	const message = gameOverMsg(score);

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
								<span className="font-bold text-blue-600">{score}</span> out of{" "}
								<span className="font-bold">{maxScore}</span>
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


