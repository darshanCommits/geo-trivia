import { Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GameSession, User } from "@shared/core.types";

const getPlayerInitials = (username: string) =>
	username.slice(0, 2).toUpperCase();

type Props = {
	session: GameSession;
	currentUser: User;
};

export default function PlayersList({ session, currentUser }: Props) {
	const players = session.users || [];

	return (
		<div className="md:col-span-2">
			<Card className="bg-white/95 backdrop-blur-sm shadow-xl">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="h-5 w-5" />
						Players ({players.length})
					</CardTitle>
				</CardHeader>

				<CardContent className="space-y-3">
					{players.map((player) => (
						<div
							key={player.username}
							className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
						>
							<div className="flex items-center gap-3">
								<span className="text-sm font-bold">
									{getPlayerInitials(player.username)}
								</span>
								<span className="font-medium">{player.username}</span>
								{player.username === currentUser.username && (
									<Badge variant="bare" className="text-xs">
										You
									</Badge>
								)}
							</div>
						</div>
					))}

					{players.length < 2 && (
						<div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-800">
							<strong>Waiting for more players...</strong> At least 2 players
							are needed to start the game.
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
