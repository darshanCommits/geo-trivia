import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Link } from "@tanstack/react-router";

type SessionCardProps = {
	sessionId: string;
	username: string;
	setSessionId: (v: string) => void;
	setUsername: (v: string) => void;
	onSubmit: () => void;
	status: string;
};

export const HostCard: React.FC<SessionCardProps> = ({
	sessionId,
	username,
	setSessionId,
	setUsername,
	onSubmit,
	status,
}) => {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Host a Session</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<Input
					placeholder="Session ID"
					value={sessionId}
					onChange={(e) => setSessionId(e.target.value)}
				/>
				<Input
					placeholder="Your Username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
				/>
				<Link to="/share" search={{ sessionId }} className="w-full">
					<Button onClick={onSubmit} className="w-full">
						Create Session
					</Button>
				</Link>

				{status && <p className="text-sm text-muted-foreground">{status}</p>}
			</CardContent>
		</Card>
	);
};

export const JoinCard: React.FC<SessionCardProps> = ({
	sessionId,
	username,
	setSessionId,
	setUsername,
	onSubmit,
	status,
}) => {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Join a Session</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<Input
					placeholder="Session ID"
					value={sessionId}
					onChange={(e) => setSessionId(e.target.value)}
				/>
				<Input
					placeholder="Your Username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
				/>
				<Button className="w-full" onClick={onSubmit}>
					Join Session
				</Button>
				{status && <p className="text-sm text-muted-foreground">{status}</p>}
			</CardContent>
		</Card>
	);
};
