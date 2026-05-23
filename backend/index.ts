import express from "express";
import { tavily } from "@tavily/core";
import { PROMPT_TEMPLATE } from "./prompt";
import { z } from "zod";

const app = express();
const port = 3000;

app.use(express.json());

const client = tavily({ apiKey: process.env.TAVILY_API_KEY });

app.post("/ask", async (req, res) => {
  // step - 1 Get the query from the user
  const query = req.body.query;

  // step - 2 make sure the user has the access/credits to hit the endpoint

  // step - 3 check if we have a web search indexed for a similar question

  // step - 4 web search to gather all the resouces

  const webSearchResponse = await client.search(query, {
    searchDepth: "basic",
  });

  const webSearchResult = webSearchResponse.results;

  // step - 5 do some context engineering on the prompt  + web search responses

  const prompt = PROMPT_TEMPLATE.replace(
    "{{WEB_SEARCH_RESULTS}}",
    JSON.stringify(webSearchResult),
  ).replace("{{USER_QUERY}}", query);

  // step - 6 hit the LLM and steam back the responses

  // step - 7 also steam back the sorces and the follow up questions (which we can get from another parallel LLM call)

  // step - 8 end steam
});

app.listen(port, () => {
  console.log(`App is listening on port http://localhost:3000`);
});

// import { generateAnswer } from "./services/ai";

// async function main() {
//   const prompt = `
// Explain how AI search engines like Perplexity work.
// `;

//   const response = await generateAnswer(prompt);

//   console.log(response);
// }

// main().catch(console.error);
