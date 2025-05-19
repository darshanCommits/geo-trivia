import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Props {
	sessionId: string;
	username: string;
	users: string[];
	isHost: boolean;
	handleLeave: () => void;
}

export const SessionInfo: React.FC<Props> = ({
	sessionId,
	username,
	users,
	isHost,
	handleLeave,
}) => (
	<Card>
		<CardHeader>
			<CardTitle>Session: {sessionId}</CardTitle>
			<p className="text-muted-foreground">You are: {username}</p>
			{isHost && <p className="text-sm text-green-600">You're the host</p>}
		</CardHeader>
		<CardContent>
			<h4 className="font-medium mb-2">Players:</h4>
			<ul className="mb-4">
				{users.map((u) => (
					<li key={u}>• {u}</li>
				))}
			</ul>
			<Button onClick={handleLeave}>Leave Session</Button>
		</CardContent>
	</Card>
);
