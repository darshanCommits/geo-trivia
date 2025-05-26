import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Loader2, LogOut } from "lucide-react";

export default function GameControls({
	user,
	canStartGame,
	startingGame,
	loading,
	onStartGame,
	onLeaveSession,
}) {
	return (
		<Card className="bg-white/95 backdrop-blur-sm shadow-xl">
			<CardContent className="p-4 space-y-3">
				{user.isHost && (
					<Button
						onClick={onStartGame}
						disabled={!canStartGame || startingGame || loading}
						className="w-full"
						size="lg"
					>
						{startingGame ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Starting Game...
							</>
						) : (
							<>
								<Play className="mr-2 h-4 w-4" />
								Start Game
							</>
						)}
					</Button>
				)}

				<Button
					variant="bare"
					onClick={onLeaveSession}
					disabled={loading}
					className="w-full"
				>
					<LogOut className="mr-2 h-4 w-4" />
					Leave Session
				</Button>
			</CardContent>
		</Card>
	);
}
