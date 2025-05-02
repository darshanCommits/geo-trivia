import type { Express } from "express";
import { Router } from "express";
import {
	initializeQuestions,
	// resetQuestions,
} from "@backend/controllers/question.controller";

export const setupRoutes = (app: Express): void => {
	const router = Router();

	router.post("/questions/init", initializeQuestions);
	app.use("/api", router);
};
