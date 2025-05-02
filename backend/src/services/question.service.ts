import type { QuestionType } from "@shared/types";
import { GoogleGenAI, type Schema, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

export const geminiConfig = (count: number): Schema => {
	return {
		type: Type.ARRAY,
		maxItems: `${count}`,
		minItems: `${count}`,
		items: {
			required: ["question", "options", "correctAnswer", "timeout", "region"],
			description: "Question Schema for geopolitical and historical quizzes.",
			type: Type.OBJECT,
			properties: {
				question: {
					type: Type.STRING,
					maxLength: "100",
					description:
						"Concise Question Description. Must be of <region>'s geopolitical and historical events.",
				},
				options: {
					type: Type.ARRAY,
					minItems: "4",
					maxItems: "4",
					description: "Array of potential answers.",
					items: {
						type: Type.STRING,
						maxLength: "50",
					},
				},
				correctAnswer: {
					type: Type.INTEGER,
					minimum: 0,
					maximum: 3,
					description: "Index of correct answer from <options>",
					format: "int32",
				},
				timeout: {
					type: Type.INTEGER,
					minimum: 7,
					maximum: 15,
					description: "Timeout for the question.",
					format: "int32",
				},
				region: {
					type: Type.STRING,
					description:
						"This can be either a city/state/country or a geographical hotspot like bermuda island.",
				},
			},
		},
	};
};

const API_KEY = process.env.GEMINI_API_KEY || "";
if (!API_KEY) {
	throw new Error("GEMINI_API_KEY is not set.");
}

const genAI = new GoogleGenAI({ apiKey: API_KEY });

export async function fetchQuestions(
	city: string,
	queCount: number,
): Promise<QuestionType[]> {
	const contents = `Generate ${queCount} concise Geo-Political-Historical questions about ${city} with a maximum of 10 words per question and a maximum of 5 words per option.`;

	const result = await genAI.models.generateContent({
		model: "gemini-2.0-flash",
		contents,
		config: {
			responseMimeType: "application/json",
			responseSchema: geminiConfig(queCount),
		},
	});

	if (!result) {
		throw new Error("Couldn't initialize gemini");
	}

	const response = result.text;
	if (!response) {
		throw new Error("Empty Response from Gemini.");
	}

	try {
		const parsed = JSON.parse(response);
		return parsed as QuestionType[];
	} catch (err) {
		console.error("Failed to parse questions:", err);
		console.error("Raw response:", response);
		throw new Error("Invalid JSON from Gemini.");
	}
}
