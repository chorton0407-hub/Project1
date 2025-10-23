import { GoogleGenerativeAI } from "@google/generative-ai";

export function getModel() {
	const apiKey = process.env.GEMINI_API_KEY;
	if (!apiKey) {
		throw new Error("GEMINI_API_KEY is not set. Add it to your environment variables.");
	}
	const genAI = new GoogleGenerativeAI(apiKey);
	return genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
}