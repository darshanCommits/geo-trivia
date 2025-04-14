import { QuestionSchema, type QuestionType } from "@shared/types";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { z } from "zod";
import toZodGem from "@lib/zod-gem";

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY || "";
if (!API_KEY) {
	throw new Error("GEMINI_API_KEY is not set.");
}

class QuestionService {
	private city: string;
	private que_count: number;
	private questions: QuestionType[] = [];
	private index = 0;
	private genAI: GoogleGenAI;

	constructor(city: string, count: number) {
		this.city = city;
		this.que_count = count;

		this.genAI = new GoogleGenAI({ apiKey: API_KEY });
	}

	setCity(city: string): void {
		this.city = city;
	}

	private async generate() {
		const contents = `Generate ${this.que_count} concise Geo-Political-Historical questions about ${this.city} with a maximum of 10 words per question and a maximum of 5 words per option.`;

		return await this.genAI.models.generateContent({
			model: "gemini-2.0-flash",
			contents,
			config: {
				responseMimeType: "application/json",
				responseSchema: toZodGem(QuestionSchema),
			},
		});
	}

	async fetchQuestions(): Promise<void> {
		const result = await this.generate();
		const response = result.text;
		if (!response) throw new Error("Empty Response from Gemini.");
		this.setValidQuestions(response);
	}

	private setValidQuestions(response: string) {
		try {
			const parsed = JSON.parse(response);
			this.questions = z.array(QuestionSchema).parse(parsed);
			this.index = 0;
		} catch (err) {
			console.error("Failed to parse questions:", err);
			console.error("Raw response:", response);
			if (err instanceof z.ZodError) {
				throw new Error(
					`Zod validation errors: ${err.errors.map((e) => e.message).join(", ")}`,
				);
			}
			throw new Error("Invalid JSON from Gemini.");
		}
	}

	getNextQuestion(): QuestionType | null {
		if (this.index < this.questions.length) {
			const question = this.questions[this.index];
			this.index++;
			return question;
		}
		return null;
	}
}

export default QuestionService;
