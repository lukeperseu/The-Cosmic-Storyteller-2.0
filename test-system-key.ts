import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  try {
    const res = await ai.models.generateContent({ model: "gemini-1.5-flash", contents: "Hi" });
    console.log("gemini-1.5-flash:", res.text);
  } catch (e: any) {
    console.error("gemini-1.5-flash error:", e.message || e);
  }
}
test();
