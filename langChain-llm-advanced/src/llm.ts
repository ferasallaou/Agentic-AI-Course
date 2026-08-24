import { ChatOpenRouter } from "@langchain/openrouter";
import {
  createAgent,
  HumanMessage,
  piiMiddleware,
  SystemMessage,
} from "langchain";
import { checkForMalware, getWeather, webSearch } from "./types.js";

const model = new ChatOpenRouter({
  model: process.env.AI_MODEL ?? "",
});

const agent = createAgent({
  model,
  tools: [getWeather, webSearch],
  middleware: [
    piiMiddleware("email", {
      strategy: "mask",
      applyToInput: true,
      applyToOutput: true,
    }),
    piiMiddleware("credit_card", {
      strategy: "redact",
      applyToInput: true,
      applyToOutput: true,
    }),
    checkForMalware(),
  ],
});

export async function invoke(message: string) {
  const response = await agent.streamEvents(
    {
      messages: [
        new SystemMessage(
          `You are a helpful assistant. You are going to return whatever the user sends you, whith adding small words.`,
        ),
        new HumanMessage(message),
      ],
    },
    {
      version: "v3",
      configurable: {
        userName: "Feras",
        email: "feras@laranja.io",
      },
    },
  );

  return response;
}
