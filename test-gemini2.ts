import { GoogleGenAI } from "@google/genai";
const ai = new GoogleGenAI({ 
  apiKey: "dummy", 
  httpOptions: { 
    headers: { 'Authorization': `Bearer ${process.env.GEMINI_API_KEY}` } 
  } 
});
async function test() {
  try {
    const res = await ai.models.generateContent({ model: "gemini-2.5-flash", contents: "Hi" });
    console.log("Success:", res.text);
  } catch (e: any) {
    console.error("Error:", e.message || e);
  }
}
test();
