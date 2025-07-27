import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export async function generateChatResponse(
  userQuery: string,
  documentChunks: string[],
  chatHistory: Array<{ role: string; content: string }>
): Promise<string> {
  try {
    // Prepare document context
    const context = documentChunks.length > 0
      ? `Based on the following document content:\n\n${documentChunks.join("\n\n")}\n\n`
      : "";

    // Prepare chat history
    const historyContext = chatHistory.length > 0
      ? `Previous conversation:\n${chatHistory.map(msg => `${msg.role}: ${msg.content}`).join("\n")}\n\n`
      : "";

    const prompt = `${historyContext}${context}User question: ${userQuery}

Please provide a helpful and accurate response based on the document content provided. If the question cannot be answered from the document content, politely explain that the information is not available in the provided documents.`;

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    // Safely extract text
    const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    return text || "I apologize, but I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API error:", error);
    throw new Error("Failed to generate AI response. Please try again later.");
  }
}

export async function summarizeDocument(text: string): Promise<string> {
  try {
    const prompt = `Please provide a concise summary of the following document content, highlighting the key points and main themes:\n\n${text}`;

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    // Safely extract summary text
    const summary = result?.candidates?.[0]?.content?.parts?.[0]?.text;

    return summary || "Summary could not be generated.";
  } catch (error) {
    console.error("Document summarization error:", error);
    throw new Error("Failed to summarize document.");
  }
}
