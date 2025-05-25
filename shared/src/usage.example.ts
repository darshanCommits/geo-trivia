
// Client usage
const client = new TriviaGameClient("ws://localhost:8080");

// Create or join session
const sessionResult = await client.createSession("PlayerName");
if ("error" in sessionResult) {
	console.error("Failed to create session:", sessionResult.error);
} else {
	console.log("Session created:", sessionResult.session.id);
	console.log("You are:", sessionResult.user.username);
}

// Listen for game events
client.on("session:user-joined", (data) => {
	console.log(`${data.user.username} joined the game`);
	// Update UI with new player list: data.session.players
});

client.on("game:question", (data) => {
	console.log(`Question ${data.questionNumber}/${data.totalQuestions}:`);
	console.log(data.question.text);
	console.log("Options:", data.question.options);
	// Start countdown timer based on data.question.timeLimit
});

client.on("game:question-end", (data) => {
	console.log("Correct answer was:", data.correctAnswer);
	console.log("Current leaderboard:", data.leaderboard);
});

// Server usage
const server = new TriviaGameServer();

server.handle("session:create", async (data) => {
	// Create new session with the user as host
	const user: User = {
		id: crypto.randomUUID(),
		username: data.username,
		sessionId: crypto.randomUUID(),
		score: 0,
	};

	const session: GameSession = {
		id: user.sessionId,
		hostUsername: user.id!,
		players: [user],
		status: "waiting",
	};

	// Store session in your database/memory

	return {
		user,
		session,
	};
});

server.handle("game:answer", async (data) => {
	// Process answer, calculate points
	const isCorrect = validateAnswer(data.answer);
	const points = calculatePoints(data.answer, isCorrect);

	// Update user's score in session
	// updateUserScore(data.userId, points);

	return {
		correct: isCorrect,
		points,
	};
});

// Helper functions (implement based on your game logic)
function validateAnswer(answer: Answer): boolean {
	// Implement answer validation
	return true;
}

function calculatePoints(answer: Answer, correct: boolean): number {
	// Implement scoring logic (time bonus, etc.)
	return correct ? Math.max(100 - (10 - answer.timeRemaining) * 10, 10) : 0;
}

export {
	type APIEndpoints,
	type ClientMessage,
	type ServerMessage,
	type User,
	type GameSession,
	type Question,
	type Answer,
	type GameResult,
	type SocketError,
	TriviaGameClient,
	TriviaGameServer,
};

