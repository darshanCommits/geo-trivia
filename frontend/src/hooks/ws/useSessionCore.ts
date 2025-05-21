import { useState, useCallback } from "react";
import { useSocket } from "../useSocket";
import { Events, type Types } from "@shared/types";
import type { SessionState } from "./types";

export const initialSessionState: SessionState = {
	sessionId: null,
	username: null,
	users: [],
	hostId: null,
	isHost: false,
	error: null,
	isLoading: false,
	joinedAt: null,
};

/**
 * Core session management hook that handles the essential session state and actions
 */
export function useSessionCore() {
	const { isConnected, emit } = useSocket();
	const [sessionState, setSessionState] =
		useState<SessionState>(initialSessionState);

	// Session actions
	const createSession = useCallback(
		(sessionId: string, username: string) => {
			if (!isConnected) {
				setSessionState((prev) => ({
					...prev,
					error: "Not connected to server.",
				}));
				return;
			}

			if (sessionState.sessionId) {
				setSessionState((prev) => ({
					...prev,
					error: "Already in a session.",
				}));
				return;
			}

			setSessionState((prev) => ({ ...prev, isLoading: true, error: null }));
			emit(Events.CREATE_SESSION, { sessionId, username });
		},
		[isConnected, sessionState.sessionId, emit],
	);

	const joinSession = useCallback(
		(sessionId: string, username: string) => {
			if (!isConnected) {
				setSessionState((prev) => ({
					...prev,
					error: "Not connected to server.",
				}));
				return;
			}

			if (sessionState.sessionId) {
				setSessionState((prev) => ({
					...prev,
					error: "Already in a session.",
				}));
				return;
			}

			setSessionState((prev) => ({ ...prev, isLoading: true, error: null }));
			emit(Events.JOIN_SESSION, { sessionId, username });
		},
		[isConnected, sessionState.sessionId, emit],
	);

	const leaveSession = useCallback(() => {
		if (sessionState.sessionId) {
			emit(Events.LEAVE_SESSION);
			setSessionState(initialSessionState);
		}
	}, [emit, sessionState.sessionId]);

	// New functions to set username and session ID
	const setUsername = useCallback((username: string | null) => {
		setSessionState((prev) => ({ ...prev, username }));
	}, []);

	const setSessionId = useCallback((sessionId: string | null) => {
		setSessionState((prev) => ({ ...prev, sessionId }));
	}, []);

	// Helpers
	const getPlayerCount = useCallback((): number => {
		return sessionState.users.length;
	}, [sessionState.users]);

	const isUserInSession = useCallback(
		(username: string): boolean => {
			return sessionState.users.some((u) => u.username === username);
		},
		[sessionState.users],
	);

	const getSessionDuration = useCallback((): number => {
		if (!sessionState.joinedAt) return 0;
		return Math.floor((Date.now() - sessionState.joinedAt.getTime()) / 1000);
	}, [sessionState.joinedAt]);

	return {
		...sessionState,
		isConnected,
		setSessionState,
		createSession,
		joinSession,
		leaveSession,
		setUsername, // <-- Add here
		setSessionId, // <-- Add here
		getPlayerCount,
		isUserInSession,
		getSessionDuration,
	};
}
