import type { Express } from "express";
import { Router } from "express";
import { initializeQuestions } from "@backend/controllers/question.controller";

export const setupRoutes = (app: Express): void => {
	const router = Router();

	router.post("/api/questions/init", initializeQuestions);

	app.use(router);
};
