import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY2 });
async function test() {
  try {
    const res = await ai.models.generateContent({ model: "gemini-3.5-flash", contents: "Say hello!" });
    console.log("Success:", res.text);
  } catch (e: any) {
    console.error("Error:", e.message || e);
  }
}
test();
