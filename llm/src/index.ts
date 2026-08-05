import express, { Express, Request, Response, NextFunction } from "express";
import { llmCall } from "./llm.js";
import { http } from "@alzulejos/laranja-decorators";

const app: Express = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: `UP & Running 🚀` });
});

app.post("/chat", async (req: Request, res: Response) => {
  const message = req.body.message ?? "";
  const messags = [
    {
      role: "user",
      content: message,
    },
  ];
  const chat = await llmCall(messags);
  res.status(200).json({ message: chat });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong inside the server" });
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});

export default http(app);
