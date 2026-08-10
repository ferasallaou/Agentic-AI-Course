import { env } from "@alzulejos/laranja-decorators";
import { ChatCompletion, ChatCompletionMessage } from "openai/resources";
import {
  ChatCompletionCreateParams,
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources.js";
import { DOCS } from "./docs.js";

export async function llmCall(results: VectorDocument[], message: string) {
  const AI_MODEL = env("AI_MODEL");
  const AI_API_URL = env("AI_API_URL") ?? "";
  const AI_API_KEY = env("AI_API_KEY");

  const context = results.map((result) => result.text).join("\n");
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: `
      Answer the user's question using only the provided context.

      Context:
      ${context}

      If the answer cannot be found in the context,
      say that you don't know.
    `,
    },
    {
      role: "user",
      content: message,
    },
  ];
  const payload: ChatCompletionCreateParams = {
    model: AI_MODEL ?? "",
    messages,
  };
  const request = await fetch(AI_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const response: ChatCompletion = await request.json();

  console.log(`Total Tokens `, response.usage?.total_tokens);
  console.log(`Input Tokens `, response.usage?.prompt_tokens);
  console.log(`Output Tokens `, response.usage?.completion_tokens);

  const choice = response.choices[0];
  if (!choice) return "";
  const msg = choice.message;

  return msg.content;
}

export async function vectorSearch(message: string) {
  const results = await search(message, 3);

  const llmCallResponse = await llmCall(results as any, message);
  return llmCallResponse;
}

async function embedText(text: string) {
  const request = await fetch(process.env.EMBEDING_API_URL ?? "", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.EMBEDING_MODEL,
      input: text,
    }),
  });

  const data = await request.json();
  const embedding = data.data[0].embedding;
  return embedding;
}

interface VectorDocument {
  text: string;
  value: number[];
}

const DB: VectorDocument[] = [];

export async function build() {
  for (let doc of DOCS) {
    const embed = await embedText(doc);
    DB.push({ text: doc, value: embed });
  }
  console.log(DB);
  return true;
}

function cosineSimilarity(query: number[], value: number[]) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < query.length; i++) {
    dot += query[i] * value[i];
    normA += query[i] * query[i];
    normB += value[i] * value[i];
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function search(question: string, k: number) {
  const embededQuestion = await embedText(question);

  const results = DB.map((doc) => ({
    text: doc.text,
    score: cosineSimilarity(embededQuestion, doc.value),
  }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);

  return results;
}
