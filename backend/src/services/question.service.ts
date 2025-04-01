import { PROMPT } from "#/data/questions.data";
import type { QuestionType } from "%/types";
import dotenv from "dotenv";

dotenv.config(); // Load .env file

const API_KEY = process.env.GEMINI_API_KEY || "";

import {
	type GenerativeModel,
	GoogleGenerativeAI,
} from "@google/generative-ai";

class QuestionService {
	private city: string;
	private questions: QuestionType[] = [];
	private index = 0;
	private genAI: GoogleGenerativeAI;
	private model: GenerativeModel;

	constructor(city: string) {
		this.city = city;
		this.genAI = new GoogleGenerativeAI(API_KEY);
		this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
	}

	setCity(city: string): void {
		this.city = city;
	}

	validateJson(text: string): string {
		const regex = /^\s*```(?:json)?\s*([\s\S]*?)\s*```\s*$/;
		const match = text.match(regex);

		if (match) {
			return match[1].trim();
		}

		if (!Array.isArray(text) || text.length === 0) {
			throw new Error("Invalid JSON format or empty response.");
		}

		return text.trim();
	}

	async fetchQuestions(): Promise<void> {
		const prompt = PROMPT(this.city);
		try {
			const result = await this.model.generateContent(prompt);
			const response = result.response;
			const text = this.validateJson(response.text());

			if (!text) {
				throw new Error("Empty Response from Gemini.");
			}

			this.questions = JSON.parse(text);
			console.log(this.questions);
			this.index = 0;
		} catch (error) {
			console.error("Failed to parse questions JSON:", error);
		}
	}

	nextQuestion(): QuestionType | null {
		if (this.index < this.questions.length) {
			return this.questions[this.index++];
		}
		return null;
	}

	reset(): void {
		this.index = 0;
	}
}

export default QuestionService;
