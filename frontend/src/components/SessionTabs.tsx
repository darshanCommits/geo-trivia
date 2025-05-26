// components/SessionTabs.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gamepad2, Users } from "lucide-react";
import { SessionForm } from "./SessionForm";

type SessionTabsProps = {
	username: string;
	setUsername: (v: string) => void;
	sessionId: string;
	setSessionId: (v: string) => void;
	handleJoinSession: () => void;
	handleCreateSession: () => void;
	loading: boolean;
};

export function SessionTabs({
	username,
	setUsername,
	sessionId,
	setSessionId,
	handleJoinSession,
	handleCreateSession,
	loading,
}: SessionTabsProps) {
	return (
		<Tabs defaultValue="join" className="w-full">
			<TabsList className="grid w-full grid-cols-2">
				<TabsTrigger value="join" className="flex items-center gap-2">
					<Users className="h-4 w-4" />
					Join Session
				</TabsTrigger>
				<TabsTrigger value="create" className="flex items-center gap-2">
					<Gamepad2 className="h-4 w-4" />
					Create Session
				</TabsTrigger>
			</TabsList>

			<TabsContent value="join" className="space-y-4 mt-6">
				<SessionForm
					mode="join"
					username={username}
					setUsername={setUsername}
					sessionId={sessionId}
					setSessionId={setSessionId}
					handleSubmit={handleJoinSession}
					loading={loading}
				/>
			</TabsContent>

			<TabsContent value="create" className="space-y-4 mt-6">
				<SessionForm
					mode="create"
					username={username}
					setUsername={setUsername}
					handleSubmit={handleCreateSession}
					loading={loading}
				/>
			</TabsContent>
		</Tabs>
	);
}
