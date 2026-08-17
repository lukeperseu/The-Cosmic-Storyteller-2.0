async function test() {
  try {
    const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${process.env.GEMINI_API_KEY}`);
    const data = await res.json();
    console.log("Token info:", data);
  } catch (e: any) {
    console.error("Error:", e.message || e);
  }
}
test();
