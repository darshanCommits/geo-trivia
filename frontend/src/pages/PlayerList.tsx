import { Users, Crown, UserCheck, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const getPlayerInitials = (username) => username.slice(0, 2).toUpperCase();

export default function PlayersList({ session, currentUser }) {
	const players = session.players || [];
	const readyPlayersCount = players.filter((p) => p.isReady).length;
	const totalPlayers = players.length;

	return (
		<div className="md:col-span-2">
			<Card className="bg-white/95 backdrop-blur-sm shadow-xl">
				<CardHeader>
					<CardTitle className="flex items-center justify-between">
						<span className="flex items-center gap-2">
							<Users className="h-5 w-5" />
							Players ({totalPlayers})
						</span>
						<Badge variant="neutral">
							{readyPlayersCount}/{totalPlayers} Ready
						</Badge>
					</CardTitle>
				</CardHeader>

				<CardContent>
					<div className="space-y-3">
						{players.map((player) => (
							<div
								key={player.username}
								className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
							>
								<div className="flex items-center gap-3">
									{getPlayerInitials(player.username)}

									<div>
										<div className="flex items-center gap-2">
											<span className="font-medium">{player.username}</span>
											{player.isHost && (
												<Crown className="h-4 w-4 text-yellow-500" />
											)}
											{player.username === currentUser.username && (
												<Badge variant="bare" className="text-xs">
													You
												</Badge>
											)}
										</div>
									</div>
								</div>

								<div className="flex items-center gap-2">
									{player.isReady ? (
										<Badge className="bg-green-100 text-green-800 border-green-200">
											<UserCheck className="h-3 w-3 mr-1" />
											Ready
										</Badge>
									) : (
										<Badge
											variant="bare"
											className="bg-yellow-50 text-yellow-700 border-yellow-200"
										>
											<Clock className="h-3 w-3 mr-1" />
											Waiting
										</Badge>
									)}
								</div>
							</div>
						))}
					</div>

					{totalPlayers < 2 && (
						<div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
							<p className="text-sm text-blue-800">
								<strong>Waiting for more players...</strong> At least 2 players
								are needed to start the game.
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
