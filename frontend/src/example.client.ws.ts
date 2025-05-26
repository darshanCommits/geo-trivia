	// Convenience methods for common operations
	// async createSession(
	// 	username: string,
	// ): Promise<ClientResponse<"session:create">> {
	// 	const result = await this.request("session:create", { username });

	// 	if (!this.isError(result)) {
	// 		this.currentUser = result.user;
	// 		// Room joining is handled automatically on the server side
	// 	}

	// 	return result;
	// }

	// Fixed joinSession method - takes username and sessionId
	// async joinSession(
	// 	username: string,
	// 	sessionId: string,
	// ): Promise<ClientResponse<"session:join">> {
	// 	const result = await this.request("session:join", { username, sessionId });

	// 	if (!this.isError(result)) {
	// 		this.currentUser = result.user;
	// 		// Room joining is handled automatically on the server side
	// 	}

	// 	return result;
	// }

	// async leaveSession(): Promise<ClientResponse<"session:leave">> {
	// 	if (!this.currentUser) {
	// 		throw new Error("No user logged in");
	// 	}

	// 	const result = await this.request("session:leave", this.currentUser);

	// 	if (!this.isError(result)) {
	// 		// Room leaving is handled automatically on the server side
	// 		this.currentUser = undefined;
	// 	}

	// 	return result;
	// }

	// async startGame(): Promise<ClientResponse<"game:start">> {
	// 	if (!this.currentUser?.username) {
	// 		throw new Error("No user logged in");
	// 	}

	// 	return this.request("game:start", {
	// 		username: this.currentUser.username,
	// 	});
	// }

	// async submitAnswer(answer: Answer): Promise<ClientResponse<"game:answer">> {
	// 	if (!this.currentUser?.username) {
	// 		throw new Error("No user logged in");
	// 	}

	// 	return this.request("game:answer", {
	// 		username: this.currentUser.username,
	// 		answer,
	// 	});
	// }

	// async skipQuestion(): Promise<ClientResponse<"game:skip">> {
	// 	if (!this.currentUser?.username) {
	// 		throw new Error("No user logged in");
	// 	}

	// 	return this.request("game:skip", {
	// 		username: this.currentUser.username,
	// 	});
	// }

