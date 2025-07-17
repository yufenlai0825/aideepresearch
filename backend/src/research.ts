import { groq } from "@ai-sdk/groq";
import { generateObject, generateText, tool } from "ai";
import { z } from "zod";
import Exa from "exa-js";
import env from "dotenv";
env.config();

// func to generate queries
const mainModel = groq("llama-3.3-70b-versatile");
const exa = new Exa(process.env.EXA_API_KEY);
type SearchResult = { title: string; url: string; content: string };

const generateSearchQueries = async (query: string, n: number = 3) => {
  const {
    object: { queries },
  } = await generateObject({
    model: mainModel,
    prompt: `Generate ${n} search queries for the following query: ${query}`,
    schema: z.object({
      queries: z.array(z.string()).min(1).max(5),
    }),
  });
  return queries;
};
