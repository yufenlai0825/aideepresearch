import { groq } from "@ai-sdk/groq";
import { generateObject, generateText, tool } from "ai";
import { z } from "zod";
import Exa from "exa-js";
import fs from "fs";
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
const searchAndProcess = async (
  query: string,
  existingSources: SearchResult[] = []
) => {
  const finalSearchResults: SearchResult[] = [];

  try {
    const searchResults = await searchWeb(query);
    for (const result of searchResults) {
      try {
        // skip repeating source
        const existedURL = existingSources.some((e) => e.url === result.url);
        if (existedURL) {
          console.log("Skipping duplicate source:", result.url);
          continue;
        }
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
// recursion + decrement depth and breadth
const deepResearch = async (
  prompt: string,
  depth: number = 2,
  breadth: number = 2
) => {
  // first search
  if (!accumulatedResearch.query) {
    accumulatedResearch.query = prompt;
  }

  if (depth === 0) {
    return accumulatedResearch;
  }

  const queries = await generateSearchQueries(prompt, breadth);
  accumulatedResearch.queries = queries;

  for (const query of queries) {
    console.log(`Search the web for: ${query}`);
    // update and skip existedURL
    const searchResults = await searchAndProcess(
      query,
      accumulatedResearch.searchResults
    );
    accumulatedResearch.searchResults.push(...searchResults);

    for (const searchResult of searchResults) {
      console.log(`Processing search result: ${searchResult.url}`);
      const learnings = await generateLearnings(query, searchResult);
      accumulatedResearch.learnings.push(learnings);
      accumulatedResearch.completedQueries.push(query);

      // decrement
      const newQuery = `Overall research goal: ${prompt}
      Previous search queries: ${accumulatedResearch.completedQueries.join(
        ", "
      )}
      Follow-up questions: ${learnings.followUpQuestions.join(", ")}`;
      await deepResearch(newQuery, depth - 1, Math.ceil(breadth / 2));
    }
  }
  return accumulatedResearch;
};

const generatepredictionTree = async (research: Research) => {
  const confidence = Math.min(
    95,
    50 + research.searchResults.length * 10 + research.learnings.length * 5
  );

  return {
    root: research.query,
    percentage: `${confidence}%`,
    sourceCount: research.searchResults.length,
    theories: research.learnings.length,
    predictions: research.learnings.map((learning, index) => ({
      theory: learning.learning,
      followupQuestions: learning.followUpQuestions.slice(0, 2),
      prediction: index === 0 ? "high" : index === 1 ? "medium" : "low",
    })),

    sources: research.searchResults.map((r) => ({
      title: r.title,
      url: r.url,
    })),

    topPrediction:
      research.learnings[0]?.learning || "No clear prediction found.",
    analysisDate: new Date().toISOString(),
  };
};

const main = async () => {
  try {
    const prompt =
      "Predict the ending of Stranger Things final season based on fan theories and cast hints.";
    const research = await deepResearch(prompt);
    console.log("Research completed! ");
    console.log("Generating prediction tree...");
    const predictionTree = await generatepredictionTree(research);
    console.log("☄️ STRANGER THINGS FINALE PREDICTIONS:");
    console.log(JSON.stringify(predictionTree, null, 2));

    // save as JSON
    fs.writeFileSync(
      `predictions-${new Date().toISOString()}.json`,
      JSON.stringify(predictionTree, null, 2)
    );
    console.log("Predictions saved to stranger-things-predictions.json");
  } catch (error) {
    console.error("Error in main:", error);
  }
};

main();
