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
    numResults: 2,
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
  console.log("=== SEARCHANDPROCESS START ===");
  console.log("Query:", query);
  console.log("Existing sources count:", existingSources.length);

  const finalSearchResults: SearchResult[] = [];

  try {
    const searchResults = await searchWeb(query);
    console.log("SearchWeb returned:", searchResults.length, "results");

    for (const result of searchResults) {
      console.log("Processing result:", result.title);

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
                
                Mark as relevant if it helps answer the question.`,
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
  console.log("=== SEARCHANDPROCESS END ===");

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

// deep-research
// recursion + decrement depth and breadth
export const deepResearch = async (
  prompt: string,
  depth: number = 2,
  breadth: number = 2
) => {
  // clean obj for each req
  const accumulatedResearch: Research = {
    query: undefined,
    queries: [],
    searchResults: [],
    learnings: [],
    completedQueries: [],
  };

  // first search
  if (!accumulatedResearch.query) {
    accumulatedResearch.query = prompt;
  }

  if (depth === 0) {
    return accumulatedResearch;
  }

  const queries = await generateSearchQueries(prompt, breadth);
  accumulatedResearch.queries = queries;
  console.log(`\n Generated ${queries.length} search queries:`);

  for (const query of queries) {
    console.log(`Search the web for: ${query}`);
    // update and skip existedURL
    const searchResults = await searchAndProcess(
      query,
      accumulatedResearch.searchResults
    );
    accumulatedResearch.searchResults.push(...searchResults);
    console.log(
      `Found ${searchResults.length} relevant sources for: "${query}"`
    );

    for (const searchResult of searchResults) {
      const learnings = await generateLearnings(query, searchResult);
      console.log(`Generated learning from: ${searchResult.title}`);
      console.log(`Key insight: ${learnings.learning.substring(0, 100)}...`);
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
  console.log("Deep Research completed successfully!");
  console.log(
    `Total sources found: ${accumulatedResearch.searchResults.length}`
  );
  console.log(
    `Total learnings generated: ${accumulatedResearch.learnings.length}`
  );
  console.log(
    `Total queries executed: ${accumulatedResearch.completedQueries.length}`
  );
  return accumulatedResearch;
};

// confidence calculation
const calculateConfidence = (research: Research) => {
  let confidence = 40; // base

  // domain diversity bonus (most important)
  const domains = new Set(
    research.searchResults.map((r) => {
      try {
        return new URL(r.url).hostname;
      } catch {
        return r.url;
      }
    })
  );

  const domainCount = domains.size;
  if (domainCount >= 4) confidence += 25;
  else if (domainCount >= 3) confidence += 15;
  else if (domainCount >= 2) confidence += 10;
  else confidence += 5;

  // content quality
  const avgLearningLength =
    research.learnings.reduce((sum, l) => sum + l.learning.length, 0) /
    research.learnings.length;

  if (avgLearningLength > 150) confidence += 15; // detailed insights
  else if (avgLearningLength > 100) confidence += 10; // good
  else if (avgLearningLength < 50) confidence -= 10; // vague

  // max + 15 for more sources
  confidence += Math.min(15, research.searchResults.length * 3);

  return Math.max(30, Math.min(85, confidence));
};

export const generatePredictionTree = async (research: Research) => {
  const confidence = calculateConfidence(research);

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

// test version with Stranger Things
// const main = async () => {
//   try {
//     const prompt =
//       "Predict the ending of Stranger Things final season based on fan theories and cast hints.";
//     const research = await deepResearch(prompt);
//     console.log("Research completed! ");
//     console.log("Generating prediction tree...");
//     const predictionTree = await generatePredictionTree(research);
//     console.log("☄️ STRANGER THINGS FINALE PREDICTIONS:");
//     console.log(JSON.stringify(predictionTree, null, 2));

//     // save as JSON
//     fs.writeFileSync(
//       `predictions-${new Date().toISOString()}.json`,
//       JSON.stringify(predictionTree, null, 2)
//     );
//     console.log("Predictions saved to json file.");
//   } catch (error) {
//     console.error("Error in main:", error);
//   }
// };

// main();
