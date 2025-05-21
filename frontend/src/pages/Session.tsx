import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SessionForm } from "@/components/SessionCard";
import { useSessionStore, type SessionState } from "@/stores/sessionStore"; // your Zustand store
import { useSocket } from "@/hooks/useSocket"; // assumed hook for isConnected, createSession, etc.
import {
	type SessionStateSetterType,
	useSessionSocket,
} from "@/hooks/useSessionSocket";

export default function Session() {
	const navigate = useNavigate();
	const [tab, setTab] = useState("host");
	const [formData, setFormData] = useState({ sessionId: "", username: "" });

	// Grab full session state as required by SessionState
	const sessionState = useSessionStore();

	// Zustand setter accepting both partial object or updater function
	const setSessionState = useSessionStore(
		(state) => state.setSessionState,
	) as SessionStateSetterType;

	const { isConnected } = useSocket();

	const { createSession, joinSession } = useSessionSocket({
		sessionState,
		setSessionState,
	});

	const updateSessionData = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
	};

	const handleHostSubmit = () => {
		const { sessionId, username } = formData;
		if (sessionId && username && isConnected && !sessionState.isLoading) {
			setSessionState({ sessionId, username, isHost: true });
			createSession(sessionId, username);
			navigate({ to: "/lobby", search: { sessionId } });
		}
	};

	const handleJoinSubmit = () => {
		const { sessionId, username } = formData;
		if (sessionId && username && isConnected && !sessionState.isLoading) {
			console.log("inside");
			setSessionState({ sessionId, username, isHost: false });
			joinSession(sessionId, username);
			navigate({ to: "/lobby", search: { sessionId } });
		}
	};
	return (
		<div className="flex items-center justify-center h-screen bg-blue-50 pattern-background">
			<Tabs value={tab} onValueChange={setTab} className="max-w-md">
				<TabsList
					className={`grid grid-cols-2 transition-colors ${
						tab === "host" ? "bg-blue-200" : "bg-white"
					}`}
				>
					<TabsTrigger value="host">Host</TabsTrigger>
					<TabsTrigger value="join">Join</TabsTrigger>
				</TabsList>

				<TabsContent value="host">
					<SessionForm
						title="Host a Session"
						sessionId={formData.sessionId}
						username={formData.username}
						setSessionId={(val) => updateSessionData("sessionId", val)}
						setUsername={(val) => updateSessionData("username", val)}
						status={sessionState.status}
						onSubmit={handleHostSubmit}
						disabled={sessionState.isLoading || !isConnected}
					/>
				</TabsContent>

				<TabsContent value="join">
					<SessionForm
						title="Join a Session"
						sessionId={formData.sessionId}
						username={formData.username}
						setSessionId={(val) => updateSessionData("sessionId", val)}
						setUsername={(val) => updateSessionData("username", val)}
						status={sessionState.status}
						onSubmit={handleJoinSubmit}
						disabled={sessionState.isLoading || !isConnected}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
}
