import express, { Express, Request, Response, NextFunction } from "express";
import { invoke } from "./llm.js";

const app: Express = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: `UP & Running 🚀` });
});

app.post("/chat", async (req: Request, res: Response) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  const message = req.body.message ?? "";

  const llmCall = await invoke(message);

  for await (const chunk of llmCall.messages) {
    for await (const tool of chunk.toolCalls) {
      res.write(`Calling Tool: ` + tool.name);
    }
    for await (const text of chunk.text) {
      res.write(text);
    }
  }
  res.end();
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong inside the server" });
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});
