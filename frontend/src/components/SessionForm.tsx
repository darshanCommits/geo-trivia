import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

type SessionFormProps = {
	mode: "create" | "join";
	username: string;
	setUsername: (v: string) => void;
	sessionId?: string;
	setSessionId?: (v: string) => void;
	handleSubmit: () => void;
	loading: boolean;
};

export function SessionForm({
	mode,
	username,
	setUsername,
	sessionId,
	setSessionId,
	handleSubmit,
	loading,
}: SessionFormProps) {
	const isJoinMode = mode === "join";

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor={`${mode}-username`}>Your Username</Label>
				<Input
					id={`${mode}-username`}
					type="text"
					placeholder="Enter your username"
					value={username}
					onChange={(e) => setUsername(e.target.value)}
					disabled={loading}
					className="w-full"
				/>
			</div>

			{isJoinMode ? (
				<div className="space-y-2">
					<Label htmlFor="session-id">Session ID</Label>
					<Input
						id="session-id"
						type="text"
						placeholder="Enter session ID"
						value={sessionId}
						onChange={(e) => setSessionId?.(e.target.value)}
						disabled={loading}
						className="w-full"
					/>
				</div>
			) : (
				<div className="p-2 bg-blue-50 border border-blue-200">
					<p className="text-sm text-blue-800">
						<strong>As the host:</strong> You'll be able to start the game once
						other players join your session.
					</p>
				</div>
			)}

			<Button
				onClick={handleSubmit}
				className="w-full"
				disabled={
					loading ||
					!username.trim() ||
					(isJoinMode && (!sessionId || !sessionId.trim()))
				}
			>
				{loading ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						{isJoinMode ? "Joining..." : "Creating..."}
					</>
				) : isJoinMode ? (
					"Join Session"
				) : (
					"Create Session"
				)}
			</Button>
		</div>
	);
}
