import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY2 });
async function test() {
  const models = ["gemini-pro-latest", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-3-flash-preview"];
  for (const model of models) {
    try {
      console.log(`Testing ${model}...`);
      const res = await ai.models.generateContent({ model: model, contents: "Say hello!" });
      console.log(`Success with ${model}:`, res.text);
      break;
    } catch (e: any) {
      console.error(`Error with ${model}:`, e.message || e);
    }
  }
}
test();
