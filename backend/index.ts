import express from "express";
import { tavily } from "@tavily/core";
import { PROMPT_TEMPLATE } from "./prompt";
import { z } from "zod";
import { groq } from "./lib/groq";

const app = express();
const port = 3000;

app.use(express.json());

const client = tavily({
  apiKey: process.env.TAVILY_API_KEY,
});

//
// ZOD SCHEMA
//

const FollowUpSchema = z.object({
  followUpQuestions: z.array(z.string()),
});

//
// ROUTE
//

app.post("/ask", async (req, res) => {
  try {
    //
    // STEP 1 - GET USER QUERY
    //

    const query = req.body.query;

    if (!query) {
      return res.status(400).json({
        error: "Query is required",
      });
    }

    //
    // STEP 2 - WEB SEARCH
    //

    const webSearchResponse = await client.search(query, {
      searchDepth: "basic",
    });

    const webSearchResult = webSearchResponse.results;

    //
    // STEP 3 - CONTEXT ENGINEERING
    //

    const prompt = PROMPT_TEMPLATE.replace(
      "{{WEB_SEARCH_RESULTS}}",
      JSON.stringify(webSearchResult),
    ).replace("{{USER_QUERY}}", query);

    //
    // STEP 4 - SSE HEADERS
    //

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.flushHeaders();

    //
    // STEP 5 - MAIN ANSWER STREAM
    //

    const stream = await groq.chat.completions.create({
      model: "qwen/qwen3-32b",

      messages: [
        {
          role: "system",
          content: "You are a helpful AI search assistant.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],

      stream: true,
    });

    //
    // STEP 6 - PARALLEL FOLLOW UP GENERATION
    //

    const followUpPromise = groq.chat.completions.create({
      model: "llama-3.1-8b-instant",

      messages: [
        {
          role: "system",
          content: `
Generate 3 follow-up questions.

Return ONLY valid JSON.

Format:
{
  "followUpQuestions": [
    "...",
    "...",
    "..."
  ]
}
`,
        },

        {
          role: "user",
          content: query,
        },
      ],
    });

    //
    // STEP 7 - STREAM MAIN ANSWER
    //

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;

      if (content) {
        res.write(`event: answer\ndata: ${JSON.stringify(content)}\n\n`);
      }
    }

    //
    // STEP 8 - FOLLOW UPS
    //

    try {
      const followUpResponse = await followUpPromise;

      const raw = followUpResponse.choices[0]?.message?.content || "{}";

      const cleaned = raw
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsed = FollowUpSchema.safeParse(JSON.parse(cleaned));

      if (parsed.success) {
        res.write(`event: followups\ndata: ${JSON.stringify(parsed.data)}\n\n`);
      }
    } catch (err) {
      console.error("Follow up generation failed:", err);
    }

    //
    // STEP 9 - SOURCES
    //

    res.write(`event: sources\ndata: ${JSON.stringify(webSearchResult)}\n\n`);

    //
    // STEP 10 - DONE
    //

    res.write(`event: done\ndata: "completed"\n\n`);

    res.end();
  } catch (err) {
    console.error(err);

    //
    // ERROR EVENT
    //

    res.write(
      `event: error\ndata: ${JSON.stringify("Something went wrong")}\n\n`,
    );

    res.end();
  }
});

//
// SERVER
//

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
