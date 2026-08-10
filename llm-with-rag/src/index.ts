import express, { Express, Request, Response, NextFunction } from "express";
import { build, llmCall, vectorSearch } from "./llm.js";
import { http } from "@alzulejos/laranja-decorators";
import { ChatCompletionMessageParam } from "openai/resources.js";

const app: Express = express();
const PORT = process.env.PORT || 3001;
const allMessages: ChatCompletionMessageParam[] = [];
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: `UP & Running 🚀` });
});

app.post("/chat", async (req: Request, res: Response) => {
  const message = req.body.message ?? "";
  const results = await vectorSearch(message);
  res.status(200).json({ message: results });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong inside the server" });
});

app.listen(PORT, async () => {
  await build();
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});

export default http(app);
