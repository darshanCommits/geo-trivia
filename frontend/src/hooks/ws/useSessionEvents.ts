import { useEffect, useCallback } from "react";
import { useSocket } from "../useSocket";
import { Events } from "@shared/types";

type User = {
	id: string;
	username: string;
	score: number;
};

type SessionState = {
	sessionId: string | null;
	username: string | null;
	users: User[];
	hostId: string | null;
	isHost: boolean;
	error: string | null;
	isLoading: boolean;
	joinedAt: Date | null;
};

type Props = {
	sessionState: SessionState;
	setSessionState: React.Dispatch<React.SetStateAction<SessionState>>;
	rejoinAttemptedRef: React.RefObject<boolean>;
	justCreatedSessionRef: React.RefObject<boolean>;
	onSessionCreated?: (sessionId: string) => void;
	onSessionClosed?: () => void;
	setStatus: (message: string) => void;
};

export function useSessionEvents({
	setSessionState,
	rejoinAttemptedRef,
	justCreatedSessionRef,
	onSessionCreated,
	onSessionClosed,
	setStatus,
}: Props): void {
	const { socket, on, off } = useSocket();

	// useCallback without ref.current in deps to avoid stale registration
	const handleSessionCreated = useCallback(
		(payload: { sessionId: string; username: string }) => {
			console.log("[useSessionEvents] handleSessionCreated fired!", payload);
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
			onSessionCreated?.(payload.sessionId);
		},
		[
			socket?.id,
			setSessionState,
			setStatus,
			onSessionCreated,
			rejoinAttemptedRef,
			justCreatedSessionRef,
		],
	);

	const handleSessionExists = useCallback(() => {
		setSessionState((prev) => ({
			...prev,
			error: "Session ID already exists.",
			isLoading: false,
		}));
		setStatus("Session already exists. Try another.");
	}, [setSessionState, setStatus]);

	const handleSessionNotFound = useCallback(() => {
		setSessionState((prev) => ({
			...prev,
			error: "Session not found.",
			isLoading: false,
		}));
		setStatus("Session not found.");
	}, [setSessionState, setStatus]);

	const handleUsernameTaken = useCallback(() => {
		setSessionState((prev) => ({
			...prev,
			error: "Username is already taken.",
			isLoading: false,
		}));
		setStatus("Username is already taken in this session.");
	}, [setSessionState, setStatus]);

	const handleUserJoined = useCallback(
		(payload: { username: string }) => {
			setSessionState((prev) =>
				prev.users.some((u) => u.username === payload.username)
					? prev
					: {
							...prev,
							users: [
								...prev.users,
								{ id: "", username: payload.username, score: 0 },
							],
						},
			);
			setStatus(`User "${payload.username}" joined.`);
		},
		[setSessionState, setStatus],
	);

	const handleUserLeft = useCallback(
		(payload: { userId: string }) => {
			setSessionState((prev) => {
				const remainingUsers = prev.users.filter(
					(u) => u.id !== payload.userId,
				);
				const becameHost =
					prev.hostId === payload.userId && remainingUsers.length > 0;
				return {
					...prev,
					users: remainingUsers,
					hostId: becameHost ? (socket?.id ?? null) : prev.hostId,
					isHost: becameHost,
				};
			});
			setStatus("User left session.");
		},
		[setSessionState, setStatus, socket?.id],
	);

	const handleSessionClosed = useCallback(() => {
		setSessionState({
			sessionId: null,
			username: null,
			users: [],
			hostId: null,
			isHost: false,
			error: null,
			isLoading: false,
			joinedAt: null,
		});
		setStatus("Session closed.");
		onSessionClosed?.();
	}, [setSessionState, setStatus, onSessionClosed]);

	useEffect(() => {
		if (!socket) return;

		console.log("[useSessionEvents] registering event handlers");
		on(Events.SESSION_CREATED, handleSessionCreated);
		on(Events.SESSION_EXISTS, handleSessionExists);
		on(Events.SESSION_NOT_FOUND, handleSessionNotFound);
		on(Events.USERNAME_TAKEN, handleUsernameTaken);
		on(Events.USER_JOINED, handleUserJoined);
		on(Events.USER_LEFT, handleUserLeft);
		on(Events.SESSION_CLOSED, handleSessionClosed);

		return () => {
			off(Events.SESSION_CREATED, handleSessionCreated);
			off(Events.SESSION_EXISTS, handleSessionExists);
			off(Events.SESSION_NOT_FOUND, handleSessionNotFound);
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
		handleSessionNotFound,
		handleUsernameTaken,
		handleUserJoined,
		handleUserLeft,
		handleSessionClosed,
	]);
}
