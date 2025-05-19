import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { SessionInfo } from "@/components/SessionInfo";
import { SessionTabs } from "@/components/SessionTab";
import { useSessionSocket } from "@/hooks/useSessionSocket";

export default function Session() {
	const {
		sessionId,
		username,
		status,
		users,
		connected,
		isHost,
		setSessionId,
		setUsername,
		handleHost,
		handleJoin,
		handleLeave,
	} = useSessionSocket();

	const navigate = useNavigate();

	useEffect(() => {
		if (connected && isHost && sessionId) {
			navigate({
				to: "/share",
				search: { sessionId },
			});
		}
	}, [connected, isHost, sessionId, navigate]);

	return (
		<div className="max-w-md mx-auto mt-10">
			{connected ? (
				<SessionInfo
					sessionId={sessionId}
					username={username}
					users={users}
					isHost={isHost}
					handleLeave={handleLeave}
				/>
			) : (
				<SessionTabs
					sessionId={sessionId}
					username={username}
					setSessionId={setSessionId}
					setUsername={setUsername}
					status={status}
					handleHost={handleHost}
					handleJoin={handleJoin}
				/>
			)}
		</div>
	);
}
