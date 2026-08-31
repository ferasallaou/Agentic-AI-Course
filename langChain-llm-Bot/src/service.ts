import { TavilySearch } from "@langchain/tavily";
import { invokeAgent } from "./agent";
import { tool } from "langchain";
import * as z from "zod";
export function invoke(message: string, thread_id: string) {
  return invokeAgent(message, thread_id);
}

export function telegramReply(text: string, chatId: number) {
  return fetch(
    `https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
      }),
    },
  );
}

export const webSearch = new TavilySearch({
  maxResults: 5,
});

function getWeather(lat: number, lon: number) {
  console.log(lat, lon);
  return fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m`,
  );
}

export const weatherTool = tool(
  async ({ lat, lon }) => {
    console.log("Calling Tool....");
    return (await getWeather(lat, lon)).json();
  },
  {
    name: "GetWeather",
    description: "Getting the weather of any city",
    schema: z.object({
      lat: z.number().describe(`Latitude of the city`),
      lon: z.number().describe(`Longitude of the city`),
    }),
  },
);
