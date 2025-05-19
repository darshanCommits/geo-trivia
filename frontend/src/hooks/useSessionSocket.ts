import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";

const socket: Socket = io("http://localhost:3000");

export const useSessionSocket = () => {
	const [sessionId, setSessionId] = useState("");
	const [username, setUsername] = useState("");
	const [status, setStatus] = useState("");
	const [users, setUsers] = useState<string[]>([]);
	const [connected, setConnected] = useState(false);
	const [isHost, setIsHost] = useState(false);

	useEffect(() => {
		const handleConnect = () => {
			console.log("Connected", socket.id);
		};

		const handleSessionCreated = ({
			sessionId,
			username,
		}: {
			sessionId: string;
			username: string;
		}) => {
			setConnected(true);
			setStatus(`Session "${sessionId}" created.`);
			setUsers([username]);
		};

		const handleSessionExists = () =>
			setStatus("Session already exists. Try another.");

		const handleSessionNotFound = () => setStatus("Session not found.");

		const handleUsernameTaken = () => setStatus("Username is already taken.");

		const handleUserJoined = ({
			username,
			message,
		}: {
			username: string;
			message: string;
		}) => {
			console.log("[user_joined]", message);
			setUsers((prev) => {
				return [...prev, username];
			});
		};

		const handleSessionClosed = () => {
			setConnected(false);
			setUsers([]);
			setStatus("Session closed.");
		};

		socket.on("connect", handleConnect);
		socket.on("session_created", handleSessionCreated);
		socket.on("session_exists", handleSessionExists);
		socket.on("session_not_found", handleSessionNotFound);
		socket.on("username_taken", handleUsernameTaken);
		socket.on("user_joined", handleUserJoined);
		socket.on("session_closed", handleSessionClosed);

		return () => {
			socket.off("connect", handleConnect);
			socket.off("session_created", handleSessionCreated);
			socket.off("session_exists", handleSessionExists);
			socket.off("session_not_found", handleSessionNotFound);
			socket.off("username_taken", handleUsernameTaken);
			socket.off("user_joined", handleUserJoined);
			socket.off("session_closed", handleSessionClosed);
		};
	}, []);

	const handleHost = () => {
		if (!sessionId || !username) {
			console.log("missing darta to create session");
			return;
		}
		setIsHost(true);
		socket.emit("create_session", { sessionId, username });
		console.log(`created session: ${sessionId}`);
	};

	const handleJoin = () => {
		if (!sessionId || !username) {
			console.log("missing darta to join session");
			return;
		}
		setIsHost(false);
		socket.emit("join_session", { sessionId, username });
		console.log(`joined session: ${sessionId}`);
	};

	const handleLeave = () => {
		socket.emit("leave_session", { sessionId });
		setConnected(false);
		setUsers([]);
		setStatus("Left the session.");
	};

	return {
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
	};
};
