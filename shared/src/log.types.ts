// ============================================================================
// LOGGING & DEBUGGING
// ============================================================================

import type { ClientEvents, ServerEvents } from "./events.types";
import type { ClientEventName, ServerEventName } from "./types";

export type LogEntry =
	| {
			// one way send
			direction: "send";
			event: ServerEventName;
			data: ServerEvents[ServerEventName];
			messageId: string;
	  }
	| {
			// two way recieve
			direction: "receive";
			event: ClientEventName;
			data: ClientEvents[ClientEventName]["request"];
			messageId: string;
	  }
	| {
			// two way send
			direction: "response";
			event: ClientEventName;
			data: ClientEvents[ClientEventName]["response"];
			messageId: string;
	  };
