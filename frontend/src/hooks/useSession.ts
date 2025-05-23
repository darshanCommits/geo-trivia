import { useEffect, useCallback } from "react";
import { Events, type Types } from "@shared/types";
import { useSocket } from "./useSocket";
import { useSessionStore } from "@/stores/sessionStore";

export function useSession({
	onSessionCreated,
	onSessionExists,
	onUsernameTaken,
	onUserJoined,
	onUserLeave,
}: {
	onSessionCreated?: (data: Types.User) => void;
	onSessionExists?: () => void;
	onUsernameTaken?: () => void;
	onUserJoined?: (data: Types.User) => void;
	onUserLeave?: (data: Types.User) => void;
} = {}) {
	const { socket, emit, isConnected } = useSocket();
	const store = useSessionStore();

	const setSessionState = store.setSessionState;

	const createSession = useCallback(
		({ sessionId, username }: Types.User) => {
			if (!socket) return;
			console.log("Emitting CREATE_SESSION with:", { sessionId, username });
			const user = { sessionId: sessionId, username: username };
			setSessionState(user);
			store.addUser(user);
			emit(Events.CREATE_SESSION, { sessionId: sessionId, username: username });
		},
		[socket, emit, store.addUser],
	);

	// TODO: this needs work on backend. backend should broadcast the user list. client should not manage it.
	// on client side there should be a listener that if backend broadcasts "USER_JOINED", it should just send the new player list. individual or whole array.
	const joinSession = useCallback(
		({ sessionId, username }: Types.User) => {
			if (socket) {
				console.log("Emitting JOIN_SESSION with:", { sessionId, username });
				const user = { sessionId: sessionId, username: username };
				setSessionState(user);
				store.addUser(user);
				emit(Events.JOIN_SESSION, { sessionId, username });
			}
		},
		[socket, emit, setSessionState],
	);

	const leaveSession = useCallback(
		({ sessionId, username }: Types.User) => {
			if (socket && onUserLeave) {
				emit(Events.LEAVE_SESSION, { sessionId, username });
				onUserLeave({ sessionId, username });
			}
		},
		[socket, emit, onUserLeave],
	);

	useEffect(() => {
		if (!socket) return;

		if (onSessionCreated) socket.on(Events.SESSION_CREATED, onSessionCreated);
		if (onSessionExists) socket.on(Events.SESSION_EXISTS, onSessionExists);
		if (onUsernameTaken) socket.on(Events.USERNAME_TAKEN, onUsernameTaken);
		if (onUserJoined) socket.on(Events.USER_JOINED, onUserJoined);

		return () => {
			socket.off(Events.SESSION_CREATED, onSessionCreated);
			socket.off(Events.SESSION_EXISTS, onSessionExists);
			socket.off(Events.USERNAME_TAKEN, onUsernameTaken);
			socket.off(Events.USER_JOINED, onUserJoined);
		};
	}, [
		socket,
		onSessionCreated,
		onSessionExists,
		onUsernameTaken,
		onUserJoined,
	]);

	return {
		socket,
		isConnected,
		createSession,
		joinSession,
		leaveSession,
	};
}
