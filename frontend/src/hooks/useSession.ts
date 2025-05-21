import { useRef } from "react";
import { useSessionCore } from "./ws/useSessionCore";
import { useSessionEvents } from "./ws/useSessionEvents";
// import { useSessionReconnection } from "./ws/useSessionReconnection";
import { useSessionStatus } from "./ws/useSessionStatus";
import type { Types } from "@shared/types";

export type SessionStatus = string;

interface UseSessionOptions {
	onSessionClosed?: () => void;
	onSessionCreated?: (sessionId: string) => void;
}

/**
 * Main hook for managing quiz game session state
 * Composes the individual session-related hooks
 */
export function useSession(options: UseSessionOptions = {}) {
	const { onSessionClosed, onSessionCreated } = options;

	// References to track session state
	const rejoinAttemptedRef = useRef(false);
	const justCreatedSessionRef = useRef(false);

	// Session status messages
	const { status, setStatus } = useSessionStatus();

	// Core session state and actions
	const sessionCore = useSessionCore();
	const {
		setSessionState,
		isConnected,
		leaveSession: coreLeaveSession,
		setUsername, // <-- Include here
		setSessionId, // <-- Include here
		...sessionState
	} = sessionCore;

	// Register socket event handlers
	useSessionEvents({
		sessionState,
		setSessionState,
		rejoinAttemptedRef,
		justCreatedSessionRef,
		onSessionCreated,
		onSessionClosed,
		setStatus,
	});

	// Handle reconnection logic
	// useSessionReconnection({
	// 	isConnected,
	// 	sessionState,
	// 	rejoinAttemptedRef,
	// 	justCreatedSessionRef,
	// 	setStatus,
	// 	setSessionState,
	// });

	// Override the core leaveSession
	const leaveSession = () => {
		if (sessionState.sessionId) {
			coreLeaveSession();
			rejoinAttemptedRef.current = false;
			setStatus("Left session.");
		}
	};

	return {
		...sessionState,
		status,
		isConnected,
		createSession: sessionCore.createSession,
		joinSession: sessionCore.joinSession,
		leaveSession,
		setUsername,
		setSessionId,
		getPlayerCount: sessionCore.getPlayerCount,
		isUserInSession: sessionCore.isUserInSession,
		getSessionDuration: sessionCore.getSessionDuration,
	};
}
