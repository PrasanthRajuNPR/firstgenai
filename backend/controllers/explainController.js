const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEYpdf });

const PROMPTS = {
  normal: (text, topic) =>
    `You are a helpful academic tutor for first-generation college students.
The student is reading a document about: "${topic}"
They selected this text: "${text}"
Explain this clearly in 3-5 sentences. Use simple language. If there are technical terms, briefly explain them.
Do NOT use markdown formatting. Just plain text.`,

  simple: (text, topic) =>
    `You are explaining something to a college student reading about "${topic}".
They selected: "${text}"
Explain this as simply as possible like explaining to a 12-year-old.
Use very simple words. Maximum 4 sentences. No jargon. Plain text only.`,

  example: (text, topic) =>
    `You are a tutor helping a student understand "${topic}".
They selected: "${text}"
Give ONE clear real-life example that explains this concept.
Start with "For example," or "Think of it like..."
3-4 sentences. Plain text only.`,
};

const explainText = async (req, res) => {
  try {
    const { selectedText, documentTopic, mode = "normal" } = req.body;

    if (!selectedText || selectedText.trim().length < 3)
      return res.status(400).json({ error: "No text selected" });

    const prompt = (PROMPTS[mode] || PROMPTS.normal)(
      selectedText.trim(),
      documentTopic || "General Academic Document"
    );

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 300,
    });

    const explanation = completion.choices[0]?.message?.content || "Could not generate explanation.";
    return res.json({ explanation });
  } catch (err) {
    console.error("Groq API error:", err);
    return res.status(500).json({ error: "AI error. Try again." });
  }
};

module.exports = { explainText };


