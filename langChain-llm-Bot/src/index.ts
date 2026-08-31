import express, { Request, Response } from "express";
import { invoke, telegramReply } from "./service";

const app = express();
const PORT = 3001;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  return res.status(200).send({ message: "Hello World!" });
});

app.post("/chat", async (req: Request, res: Response) => {
  const message = req.body.message ?? "";
  const thread_id = req.body.id;

  const llmCall = await invoke(message, thread_id);

  return res.status(200).send({ message: llmCall.messages.at(-1)?.content });
});

app.post("/webhooks", async (req, res) => {
  const message = req.body.message.text;
  const chatId = req.body.message.chat.id;
  const userId = req.body.message.from.id;
  console.log("Call to Webhook");
  if (message[0] === "/") return res.status(200).send(true);
  const llmCall = await invoke(message, `TELEGRAM:${userId}`);
  const response = llmCall.messages.at(-1)?.content as string;
  console.log("Response from LLM");
  await telegramReply(response, chatId);
  return res.status(200).send(true);
});

app.listen(PORT, () => {
  console.log(`Up & Running on ${PORT}`);
});
