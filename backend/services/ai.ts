import type { Response } from "express";
import { getGroqClient } from "../lib/groq";

export async function streamAnswer(prompt: string, res: Response) {
  try {
    const groq = getGroqClient();

    const stream = await groq.chat.completions.create({
      model: "qwen/qwen3-32b",

      messages: [
        {
          role: "system",
          content: "Return ONLY valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],

      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;

      if (content) {
        res.write(content);
      }
    }

    res.end();
  } catch (err) {
    console.error(err);

    res.status(500).end("Groq API failed");
  }
}
