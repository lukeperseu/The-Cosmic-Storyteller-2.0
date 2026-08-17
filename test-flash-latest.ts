import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY2 });
async function test() {
  try {
    const res = await ai.models.generateContent({ model: "gemini-flash-latest", contents: "Say hello!" });
    console.log("Success:", res.text);
  } catch (e: any) {
    console.error("Error:", e.message || e);
  }
}
test();
