import type { Request, Response } from "express";
import { createAccount, validateAccount } from "@backend/services/auth.service";
import jwt from "jsonwebtoken";
import { config } from "../config";

export async function register(req: Request, res: Response) {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({ error: "Email and password are required" });
		}

		const account = await createAccount(email, password);
		const token = jwt.sign({ id: account.id }, config.JWT_SECRET, {
			expiresIn: "24h",
		});

		res.status(201).json({ token });
	} catch (error) {
		if (error.code === "23505") {
			// Unique violation
			return res.status(400).json({ error: "Email already exists" });
		}
		res.status(500).json({ error: "Internal server error" });
	}
}

export async function login(req: Request, res: Response) {
	try {
		const { email, password } = req.body;

		if (!email || !password) {
			return res.status(400).json({ error: "Email and password are required" });
		}

		const account = await validateAccount(email, password);

		if (!account) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		const token = jwt.sign({ id: account.id }, config.JWT_SECRET, {
			expiresIn: "24h",
		});

		res.json({ token });
	} catch (error) {
		res.status(500).json({ error: "Internal server error" });
	}
}
