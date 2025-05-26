import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export default function InstructionsCard() {
	return (
		<Card className="bg-white/95 backdrop-blur-sm shadow-xl">
			<CardHeader>
				<CardTitle className="text-sm">How to Play</CardTitle>
			</CardHeader>
			<CardContent className="text-xs text-gray-600 space-y-2">
				<p>• Share the session ID with friends</p>
				<p>• Wait for all players to be ready</p>
				<p>• Host starts the game when ready</p>
				<p>• Answer questions as quickly as possible</p>
				<p>• Points are awarded for speed and accuracy</p>
			</CardContent>
		</Card>
	);
}
