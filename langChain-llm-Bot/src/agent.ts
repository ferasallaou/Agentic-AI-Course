import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { ChatOpenRouter } from "@langchain/openrouter";
import {
  BaseMessage,
  createAgent,
  HumanMessage,
  SystemMessage,
} from "langchain";
import { weatherTool, webSearch } from "./service";

const model = new ChatOpenRouter({
  model: process.env.AI_MODEL,
});

async function prepareAgent() {
  const checkpointer = PostgresSaver.fromConnString(process.env.DB_URL!);
  await checkpointer.setup();
  return createAgent({
    model,
    checkpointer,
    tools: [weatherTool, webSearch],
  });
}

export async function invokeAgent(message: string, thread_id: string) {
  const messages: BaseMessage[] = [
    new SystemMessage("You are a helpful Assistant"),
    new HumanMessage(message),
  ];
  const agent = await prepareAgent();
  return agent.invoke(
    {
      messages,
    },
    {
      configurable: {
        thread_id,
      },
    },
  );
}
