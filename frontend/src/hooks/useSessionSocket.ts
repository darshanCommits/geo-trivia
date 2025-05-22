// useSessionSocket.ts
import { useCallback, useEffect, useRef } from "react";
import { useSocket } from "./useSocket";
import { Events, Types } from "@shared/types";
import { type SessionState, initialSessionState } from "@/stores/sessionStore";

export type SessionStateSetterType = (
	partial:
		| Partial<SessionState>
		| ((state: SessionState) => Partial<SessionState>),
) => void;

export function useSessionSocket({
	sessionState,
	setSessionState,
}: {
	sessionState: SessionState;
	setSessionState: SessionStateSetterType;
}) {
	const { socket, isConnected, emit, on, off } = useSocket();
	const rejoinAttemptedRef = useRef(false);
	const justCreatedSessionRef = useRef(false);

	const setStatus = useCallback(
		(message: string) => {
			setSessionState((prev) => ({ ...prev, status: message }));
			console.log(`Status update: ${message}`); // Add logging for status updates
		},
		[setSessionState],
	);

	const createSession = useCallback(
		(sessionId: string, username: string) => {
			if (!isConnected) {
				setStatus("Not connected to server.");
				setSessionState((prev) => ({ ...prev, error: "Not connected." }));
				return;
			}

			if (sessionState.sessionId) {
				setStatus("Already in a session.");
				setSessionState((prev) => ({ ...prev, error: "Already in session." }));
				return;
			}

			setSessionState((prev) => ({
				...prev,
				sessionId,
				username,
				isLoading: true,
				error: null,
			}));
			setStatus("Attempting to create session...");
			emit(Events.CREATE_SESSION, { sessionId, username });
			console.log(
				`Emitting CREATE_SESSION with sessionId: ${sessionId}, username: ${username}`,
			);
		},
		[isConnected, sessionState.sessionId, emit, setSessionState, setStatus],
	);

	const joinSession = useCallback(
		(sessionId: string, username: string) => {
			if (!isConnected) {
				setStatus("Not connected to server.");
				setSessionState((prev) => ({ ...prev, error: "Not connected." }));
				return;
			}

			if (sessionState.sessionId) {
				setStatus("Already in a session.");
				setSessionState((prev) => ({ ...prev, error: "Already in session." }));
				return;
			}

			setSessionState((prev) => ({
				...prev,
				sessionId, // Store the sessionId when joining
				username, // Store the username when joining
				isLoading: true,
				error: null,
			}));
			setStatus(
				`Attempting to join session "${sessionId}" as "${username}"...`,
			);
			emit(Events.JOIN_SESSION, { sessionId, username });
			console.log(
				`Emitting JOIN_SESSION with sessionId: ${sessionId}, username: ${username}`,
			);

			// Note: When joining a session, we don't immediately get all users
			// We'll need to wait for USER_JOINED events from the server to populate the users list
		},
		[isConnected, sessionState.sessionId, emit, setSessionState, setStatus],
	);

	const leaveSession = useCallback(() => {
		if (sessionState.sessionId) {
			emit(Events.LEAVE_SESSION);
			setSessionState(initialSessionState);
			setStatus("Leaving session...");
			console.log("Emitting LEAVE_SESSION");
		}
	}, [emit, sessionState.sessionId, setSessionState, setStatus]);

	const handleSessionCreated = useCallback(
		(payload: { sessionId: string; username: string }) => {
			console.log("SESSION_CREATED event received:", payload);
			rejoinAttemptedRef.current = true;
			justCreatedSessionRef.current = true;

			setSessionState((prev) => ({
				...prev,
				sessionId: payload.sessionId,
				username: payload.username,
				hostId: socket?.id ?? null,
				isHost: true,
				error: null,
				isLoading: false,
				users: [{ id: socket?.id ?? "", username: payload.username, score: 0 }],
				joinedAt: new Date(),
			}));
			setStatus(`Session "${payload.sessionId}" created.`);
		},
		[setSessionState, socket?.id, setStatus],
	);

	// No SESSION_JOINED event in the backend events
	// Instead, we'll need to handle USER_JOINED events for this purpose

	const handleSessionExists = useCallback(() => {
		setSessionState((prev) => ({
			...prev,
			error: "Session ID already exists.",
			isLoading: false,
		}));
		setStatus("Session already exists. Try another.");
	}, [setSessionState, setStatus]);

	const handleUsernameTaken = useCallback(() => {
		console.log("USERNAME_TAKEN event received");
		setSessionState((prev) => ({
			...prev,
			error: "Username is already taken.",
			isLoading: false,
			sessionId: null,
			username: null,
		}));
		setStatus("Username is already taken in this session.");
	}, [setSessionState, setStatus]);

	const handleUserJoined = useCallback(
		(payload: { username: string; id: string }) => {
			console.log("USER_JOINED event received:", payload);

			// If this is our own USER_JOINED event (matching our socket ID)
			// Then we need to update more state than just adding a user
			const isOwnJoin = socket?.id === payload.id;

			if (isOwnJoin) {
				console.log(
					"This is our own USER_JOINED event - we've successfully joined the session",
				);
				setSessionState((prev) => ({
					...prev,
					isLoading: false,
					error: null,
					joinedAt: new Date(),
					// Don't set isHost here - we don't know yet
					// The first user in the list might be the host, but we need server confirmation
				}));
			}

			// Always try to update the users list
			setSessionState((prev) => {
				// Check if user already exists in our list
				const userExists = prev.users.some((u) => u.id === payload.id);

				if (userExists) {
					console.log(
						`User ${payload.username} (${payload.id}) already exists in state`,
					);
					return prev;
				}

				console.log(`Adding user ${payload.username} (${payload.id}) to state`);

				// Add the new user to our list
				return {
					...prev,
					users: [
						...prev.users,
						{ id: payload.id, username: payload.username, score: 0 },
					],
				};
			});

			// Update status message
			if (!isOwnJoin) {
				setStatus(`User "${payload.username}" joined.`);
			} else {
				setStatus(`You've joined the session as "${payload.username}".`);
			}
		},
		[setSessionState, setStatus, socket?.id],
	);

	const handleUserLeft = useCallback(
		(payload: { userId: string }) => {
			console.log("USER_LEFT event received:", payload);

			// Find the username of the leaving user before filtering them out
			let leavingUsername = "Unknown user";

			setSessionState((prev) => {
				// Find the leaving user to get their username
				const leavingUser = prev.users.find((u) => u.id === payload.userId);
				if (leavingUser) {
					leavingUsername = leavingUser.username;
				}

				const remainingUsers = prev.users.filter(
					(u) => u.id !== payload.userId,
				);

				// Handle host changes if the host left
				const becameHost =
					prev.hostId === payload.userId && remainingUsers.length > 0;
				const newHostId = becameHost ? remainingUsers[0].id : prev.hostId;
				const isNowHost = newHostId === socket?.id;

				return {
					...prev,
					users: remainingUsers,
					hostId: newHostId,
					isHost: isNowHost,
				};
			});

			setStatus(`User "${leavingUsername}" left the session.`);
		},
		[setSessionState, socket?.id, setStatus],
	);

	const handleSessionClosed = useCallback(() => {
		console.log("SESSION_CLOSED event received");
		setSessionState(initialSessionState);
		setStatus("Session closed.");
	}, [setSessionState, setStatus]);

	// Set up event listeners when the socket is available
	useEffect(() => {
		if (!socket) {
			console.log("Socket not available - not setting up listeners");
			return;
		}

		console.log("Setting up socket event listeners for session events");

		// List of all possible events we need to handle
		on(Events.SESSION_CREATED, handleSessionCreated);
		on(Events.SESSION_EXISTS, handleSessionExists);
		on(Events.USERNAME_TAKEN, handleUsernameTaken);
		on(Events.USER_JOINED, handleUserJoined);
		on(Events.USER_LEFT, handleUserLeft);
		on(Events.SESSION_CLOSED, handleSessionClosed);

		// Clean up listeners when component unmounts or socket changes
		return () => {
			console.log("Cleaning up socket event listeners");
			off(Events.SESSION_CREATED, handleSessionCreated);
			off(Events.SESSION_EXISTS, handleSessionExists);
			off(Events.USERNAME_TAKEN, handleUsernameTaken);
			off(Events.USER_JOINED, handleUserJoined);
			off(Events.USER_LEFT, handleUserLeft);
			off(Events.SESSION_CLOSED, handleSessionClosed);
		};
	}, [
		socket,
		on,
		off,
		handleSessionCreated,
		handleSessionExists,
		handleUsernameTaken,
		handleUserJoined,
		handleUserLeft,
		handleSessionClosed,
	]);

	// Auto-rejoin session on reconnect if we were in a session
	useEffect(() => {
		if (
			isConnected &&
			sessionState.sessionId &&
			sessionState.username &&
			!rejoinAttemptedRef.current
		) {
			console.log("Attempting to auto-rejoin session");
			rejoinAttemptedRef.current = true;
			joinSession(sessionState.sessionId, sessionState.username);
		}

		if (!isConnected) {
			rejoinAttemptedRef.current = false;
		}
	}, [isConnected, sessionState.sessionId, sessionState.username, joinSession]);

	return {
		isConnected,
		createSession,
		joinSession,
		leaveSession,
		setStatus,
		sessionState,
	};
}
