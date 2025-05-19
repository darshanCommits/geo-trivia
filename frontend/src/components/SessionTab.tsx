import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HostCard, JoinCard } from "@/components/SessionCard";

interface Props {
	sessionId: string;
	username: string;
	setSessionId: (v: string) => void;
	setUsername: (v: string) => void;
	status: string;
	handleHost: () => void;
	handleJoin: () => void;
}

export const SessionTabs: React.FC<Props> = ({
	sessionId,
	username,
	setSessionId,
	setUsername,
	status,
	handleHost,
	handleJoin,
}) => (
	<Tabs defaultValue="host" className="w-full">
		<TabsList className="grid grid-cols-2">
			<TabsTrigger value="host">Host</TabsTrigger>
			<TabsTrigger value="join">Join</TabsTrigger>
		</TabsList>

		<TabsContent value="host">
			<HostCard
				sessionId={sessionId}
				username={username}
				setSessionId={setSessionId}
				setUsername={setUsername}
				onSubmit={handleHost}
				status={status}
			/>
		</TabsContent>

		<TabsContent value="join">
			<JoinCard
				sessionId={sessionId}
				username={username}
				setSessionId={setSessionId}
				setUsername={setUsername}
				onSubmit={handleJoin}
				status={status}
			/>
		</TabsContent>
	</Tabs>
);
