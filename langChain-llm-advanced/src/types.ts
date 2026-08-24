import { RunnableConfig } from "@langchain/core/runnables";
import { tool } from "@langchain/core/tools";
import { TavilySearch } from "@langchain/tavily";
import { AIMessage, createMiddleware } from "langchain";
import * as z from "zod";

export const Person = z.object({
  fullName: z.string().describe("The fullname of the person"),
  achivments: z
    .array(z.string())
    .describe("Any array holding all the achivments of that person"),
  netWorth: z.number().describe("The networth of that person"),
});

export const Joke = z.object({
  openingLine: z.string().describe("The Opening of that joke"),
  punchLine: z.string().describe("THe punch Line"),
});

export const getWeather = tool(
  async (input, config: RunnableConfig) => {
    const userName = config.configurable?.userName;
    const email = config.configurable?.email;
    return returnWeather(input.city);
  },
  {
    name: "getWeather",
    description: "A tool to get the weather in a given city",
    schema: z.object({
      city: z.string().describe(`The city to get the weather for!`),
    }),
  },
);

async function returnWeather(city: string) {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`,
  );

  const data = await response.json();

  return data;
}

export const webSearch = new TavilySearch({
  maxResults: 5,
});

export function checkForMalware() {
  const BAD_WORDS = ["hack", "virus"];
  return createMiddleware({
    name: "checkForMalware",
    beforeAgent: {
      hook: (state) => {
        const userMessage = state.messages.at(-1)?.content ?? "";
        for (const word of userMessage) {
          if (BAD_WORDS.includes(word.toLowerCase())) {
            return {
              messages: [
                new AIMessage(`Sorry I cannot assist you with this request!`),
              ],
              jumpTo: "end",
            };
          }
        }
      },
      canJumpTo: ["end"],
    },
  });
}
