import { Router } from "express";
import { register, login } from "@backend/controllers/auth.controller";

export const setupAuthRoutes = (): Router => {
	const router = Router();

	router.post("/register", register);
	router.post("/login", login);

	return router;
};

export default setupAuthRoutes;
