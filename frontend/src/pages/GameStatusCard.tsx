import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function GameStatusCard({ session, user }) {
	const players = session.players || [];
	const readyPlayersCount = players.filter((p) => p.isReady).length;
	const totalPlayers = players.length;

	return (
		<Card className="bg-white/95 backdrop-blur-sm shadow-xl">
			<CardHeader>
				<CardTitle className="text-lg">Game Status</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex items-center justify-between">
					<span className="text-sm text-gray-600">Status:</span>
					<Badge
						variant={session.status === "waiting" ? "neutral" : "default"}
						className="capitalize"
					>
						{session.status}
					</Badge>
				</div>

				<div className="flex items-center justify-between">
					<span className="text-sm text-gray-600">Ready Players:</span>
					<span className="font-medium">
						{readyPlayersCount}/{totalPlayers}
					</span>
				</div>

				{user.isHost && (
					<div className="pt-2 border-t">
						<p className="text-xs text-gray-500 mb-3">
							As the host, you can start the game when ready.
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
