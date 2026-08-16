import { ChatOpenRouter } from "@langchain/openrouter";
import { createAgent, HumanMessage, SystemMessage } from "langchain";
import { getWeather, webSearch } from "./types.js";

const model = new ChatOpenRouter({
  model: process.env.AI_MODEL ?? "",
});

const agent = createAgent({
  model,
  tools: [getWeather, webSearch],
});

export async function invoke(message: string) {
  const response = await agent.invoke({
    messages: [
      new SystemMessage(`You are a helpful assistant`),
      new HumanMessage(message),
    ],
  });

  return response;
}
