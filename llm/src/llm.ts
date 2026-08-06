import { env } from "@alzulejos/laranja-decorators";
import {
  ChatCompletion,
  ChatCompletionCreateParams,
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources.js";

export async function llmCall(messages: ChatCompletionMessageParam[]) {
  console.log(`Calling LLM with ${messages.length} messages`);
  const AI_MODEL = env("AI_MODEL");
  const AI_API_URL = env("AI_API_URL") ?? "";
  const AI_API_KEY = env("AI_API_KEY");

  const payload: ChatCompletionCreateParams = {
    model: AI_MODEL ?? "",
    messages,
    tools: LLM_TOOLS,
    temperature: 0.2,
  };

  const request = await fetch(AI_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const response: ChatCompletion = await request.json();
  console.log(`total token usage: `, response.usage?.total_tokens);
  const choice = response.choices[0];
  if (!choice) return "";
  const msg = choice.message;
  if (msg.tool_calls && msg.tool_calls.length > 0) {
    for (let i = 0; i < msg.tool_calls.length; i++) {
      const currentTool = msg.tool_calls[i];
      if (currentTool.type != "function") continue;
      const fnName = currentTool.function.name;
      const payload = JSON.parse(currentTool.function.arguments);
      if (fnName === "getPersonalInfo") {
        return getPersonalInfo(payload.name);
      } else {
        return getHobbies(payload.name);
      }
    }
  }
  return msg.content;
}

export const LLM_TOOLS: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "getPersonalInfo",
      description: "You get information about the person",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Name of the person",
          },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "getHobbies",
      description:
        "You get information about the person's hobbies and interests",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Name of the person",
          },
        },
        required: ["name"],
      },
    },
  },
];

function getPersonalInfo(name: string) {
  if (name.toLowerCase() === "feras")
    return "Feras is 37 years old, lives in Lisbon, Work as a fullstack engineer!";
  else return "Alex is 23 years old, lives on Mars, Work as an explorer!";
}

function getHobbies(name: string) {
  if (name.toLowerCase() === "feras")
    return "GYM, Programming, Reading, outdoors, travelling";
  else return "Sight seeing, gazing";
}
