import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: { 'User-Agent': 'aistudio-build' }
  }
});
async function test() {
  try {
    const res = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: "Hi" });
    console.log(res.text);
  } catch (e: any) {
    console.error(e.message || e);
  }
}
test();
