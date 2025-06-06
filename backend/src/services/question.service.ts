import { GoogleGenAI, type Schema, Type } from "@google/genai";
import dotenv from "dotenv";
import type { Question } from "@shared/core.types";

dotenv.config();

export const geminiConfig = (count: number): Schema => {
	return {
		type: Type.ARRAY,
		maxItems: `${count}`,
		minItems: `${count}`,
		items: {
			required: ["text", "options", "correctAnswer", "timeout", "region"],
			description: "Question Schema for geopolitical and historical quizzes.",
			type: Type.OBJECT,
			properties: {
				text: {
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
): Promise<Question[]> {
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
		return parsed as Question[];
	} catch (err) {
		console.error("Failed to parse questions:", err);
		console.error("Raw response:", response);
		throw new Error("Invalid JSON from Gemini.");
	}
}

export const fetchMockQuestions = async (): Promise<Question[]> => {
	await new Promise((resolve) => setTimeout(resolve, 100));

	return [
		{
			correctAnswer: 0,
			options: [
				"Sisodia Rajput",
				"Maurya Empire",
				"Mughal Empire",
				"Gupta Dynasty",
			],
			text: "Udaipur: Which Rajput clan founded it?Udaipur: Which Rajput clan founded it?",
			region: "Udaipur",
			timeout: 15,
		},
		{
			correctAnswer: 2,
			options: ["Lake Pichola", "Fateh Sagar", "Lake Palace", "Lake Badi"],
			text: "Udaipur's Lake Palace: Which lake is it on?Udaipur's Lake Palace: Which lake is it on?",
			region: "Udaipur",
			timeout: 15,
		},
		{
			correctAnswer: 1,
			options: ["1559", "1568", "1576", "1585"],
			text: "Udaipur: When did the Mughals attack?",
			region: "Udaipur",
			timeout: 15,
		},

		{
			correctAnswer: 0,
			options: [
				"Sisodia Rajput",
				"Maurya Empire",
				"Mughal Empire",
				"Gupta Dynasty",
			],
			text: "Udaipur: Which Rajput clan founded it?",
			region: "Udaipur",
			timeout: 15,
		},
		{
			correctAnswer: 2,
			options: ["Lake Pichola", "Fateh Sagar", "Lake Palace", "Lake Badi"],
			text: "Udaipur's Lake Palace: Which lake is it on?",
			region: "Udaipur",
			timeout: 15,
		},
		{
			correctAnswer: 1,
			options: ["1559", "1568", "1576", "1585"],
			text: "Udaipur: When did the Mughals attack?",
			region: "Udaipur",
			timeout: 15,
		},

		{
			correctAnswer: 0,
			options: [
				"Sisodia Rajput",
				"Maurya Empire",
				"Mughal Empire",
				"Gupta Dynasty",
			],
			text: "Udaipur: Which Rajput clan founded it?",
			region: "Udaipur",
			timeout: 15,
		},
		{
			correctAnswer: 2,
			options: ["Lake Pichola", "Fateh Sagar", "Lake Palace", "Lake Badi"],
			text: "Udaipur's Lake Palace: Which lake is it on?",
			region: "Udaipur",
			timeout: 15,
		},
		{
			correctAnswer: 1,
			options: ["1559", "1568", "1576", "1585"],
			text: "Udaipur: When did the Mughals attack?",
			region: "Udaipur",
			timeout: 15,
		},

		{
			correctAnswer: 0,
			options: [
				"Sisodia Rajput",
				"Maurya Empire",
				"Mughal Empire",
				"Gupta Dynasty",
			],
			text: "Udaipur: Which Rajput clan founded it?",
			region: "Udaipur",
			timeout: 15,
		},
		{
			correctAnswer: 2,
			options: ["Lake Pichola", "Fateh Sagar", "Lake Palace", "Lake Badi"],
			text: "Udaipur's Lake Palace: Which lake is it on?",
			region: "Udaipur",
			timeout: 15,
		},
		{
			correctAnswer: 1,
			options: ["1559", "1568", "1576", "1585"],
			text: "Udaipur: When did the Mughals attack?",
			region: "Udaipur",
			timeout: 15,
		},

		{
			correctAnswer: 0,
			options: [
				"Sisodia Rajput",
				"Maurya Empire",
				"Mughal Empire",
				"Gupta Dynasty",
			],
			text: "Udaipur: Which Rajput clan founded it?",
			region: "Udaipur",
			timeout: 15,
		},
		{
			correctAnswer: 2,
			options: ["Lake Pichola", "Fateh Sagar", "Lake Palace", "Lake Badi"],
			text: "Udaipur's Lake Palace: Which lake is it on?",
			region: "Udaipur",
			timeout: 15,
		},
		{
			correctAnswer: 1,
			options: ["1559", "1568", "1576", "1585"],
			text: "Udaipur: When did the Mughals attack?",
			region: "Udaipur",
			timeout: 15,
		},
	];
};
