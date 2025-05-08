import { register, login } from "@backend/controllers/auth.controller";
import type { Express } from "express";
import { Router } from "express";
import { initializeQuestions } from "@backend/controllers/question.controller";
import setupAuthRoutes from "./auth.routes";

export const setupRoutes = (_: Express): void => {
	const router = Router();

	router.post("/api/questions/init", initializeQuestions);

	router.post("/register", register);
	router.post("/login", login);
	// router.use("/auth", setupAuthRoutes());
};
