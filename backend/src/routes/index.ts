import type { Express } from "express";
import { Router } from "express";
import {
	getNextQuestion,
	initializeQuestions,
	resetQuestions,
} from "#/controllers/question.controller";

export const setupRoutes = (app: Express): void => {
	const router = Router();

	router.get("/questions/next", getNextQuestion);

	router.post("/questions/init", initializeQuestions);
	router.post("/questions/reset", resetQuestions);

	// Attach router to the app
	app.use("/api", router);
};
