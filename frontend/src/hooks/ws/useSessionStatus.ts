import { useState } from "react";

export type SessionStatus = string;

/**
 * Hook for managing session status messages
 */
export function useSessionStatus() {
	const [status, setStatus] = useState<SessionStatus>("");

	return {
		status,
		setStatus,
	};
}
