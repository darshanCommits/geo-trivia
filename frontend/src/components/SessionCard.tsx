import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { generateSessionId, generateUsername } from "@/lib/generate";

type SessionCardProps = {
	sessionId: string;
	username: string;
	setSessionId: (v: string) => void;
	setUsername: (v: string) => void;
	onSubmit: () => void;
	status: string;
	title: string;
	disabled: boolean;
};

export const SessionForm: React.FC<SessionCardProps> = ({
	title,
	sessionId,
	username,
	setSessionId,
	setUsername,
	onSubmit,
	status,
}) => {
	return (
		<Card className="bg-white">
			<CardHeader>
				<CardTitle>{title}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex gap-2">
					<Input
						placeholder="Session ID"
						value={sessionId}
						onChange={(e) => setSessionId(e.target.value)}
						className="flex-1"
					/>
					<Button
						type="button"
						onClick={() => setSessionId(generateSessionId())}
					>
						⚡
					</Button>
				</div>
				<div className="flex gap-2">
					<Input
						placeholder="Your Username"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						className="flex-1"
					/>
					<Button type="button" onClick={() => setUsername(generateUsername())}>
						⚡
					</Button>
				</div>
				<Button className="w-full" onClick={onSubmit}>
					{title}
				</Button>
				{status && <p className="text-sm text-muted-foreground">{status}</p>}
			</CardContent>
		</Card>
	);
};
