import { groq } from "@ai-sdk/groq";
import { generateObject, generateText, tool } from "ai";
import { z } from "zod";
import Exa from "exa-js";
import env from "dotenv";
env.config();

const mainModel = groq("llama-3.3-70b-versatile");
const exa = new Exa(process.env.EXA_API_KEY);
type SearchResult = { title: string; url: string; content: string };

// generate queries
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

// searching online
const searchWeb = async (query: string) => {
  const { results } = await exa.searchAndContents(query, {
    numResults: 1,
    livecrawl: "never",
    // "never" as to save costs
  });
  return results.map(
    (r) =>
      ({
        title: r.title,
        url: r.url,
        content: r.text,
      } as SearchResult)
  );
};

// evaluate and keep the relevant info
const searchAndProcess = async (query: string) => {
  const finalSearchResults: SearchResult[] = [];

  try {
    const searchResults = await searchWeb(query);
    for (const result of searchResults) {
      try {
        const { object: evaluation } = await generateObject({
          model: mainModel,
          prompt: `You are a researcher. Evaluate whether this result is relevant and help to answer the query: ${query}. 
                
                Search Result:
                Title: ${result.title}
                URL: ${result.url}
                Content Preview: ${result.content.substring(0, 300)}...
                
                Only mark as relevant if it directly helps answer the question. Be strict.`,
          // only evaluate the first 300 characters
          output: "enum", // only return one of the two
          enum: ["relevant", "irrelevant"],
        });

        console.log("Evaluation for:", result.title + ":", evaluation);
        if (evaluation === "relevant") {
          finalSearchResults.push(result);
          console.log("Relevant. Added to final results.");
        } else {
          console.log("Skipped irrelevant result.");
        }
      } catch (error) {
        console.error("Error evaluating result:", error);
      }
    }
  } catch (error) {
    console.error("Error in searchAndProcess:", error);
  }
  return finalSearchResults;
};

// learning
const generateLearnings = async (query: string, searchResult: SearchResult) => {
  const { object } = await generateObject({
    model: mainModel,
    prompt: `The user is researching "${query}". Generate a learning and a follow-up question from this result:
 
    Title: ${searchResult.title}
    URL: ${searchResult.url}
    Content: ${searchResult.content.substring(0, 500)}...
    `,
    // limit content
    schema: z.object({
      learning: z.string(),
      followUpQuestions: z.array(z.string()),
    }),
  });
  return object;
};

// blueprint to store learnings + follow-up questions
type Learning = {
  learning: string;
  followUpQuestions: string[];
};

type Research = {
  query: string | undefined;
  queries: string[];
  searchResults: SearchResult[];
  learnings: Learning[];
  completedQueries: string[];
};

const accumulatedResearch: Research = {
  query: undefined,
  queries: [],
  searchResults: [],
  learnings: [],
  completedQueries: [],
};

// deep-research
// recursion + depth and breadth
const deepResearch = async (
  query: string,
  depth: number = 1,
  breadth: number = 3
) => {
  const queries = await generateSearchQueries(query);
  for (const query of queries) {
    console.log(`Search the web for: ${query}`);
    const searchResults = await searchAndProcess(query);
    for (const searchResult of searchResults) {
      console.log(`Processing search result: ${searchResult.url}`);
      const learnings = await generateLearnings(query, searchResult);
    }
  }
};

const main = async () => {
  try {
    const prompt = "How to become an Olympic runner?";
    const research = await deepResearch(prompt);
  } catch (error) {
    console.error("Error in main:", error);
  }
};

main();
