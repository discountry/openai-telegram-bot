import { ChatGPTUnofficialProxyAPI } from "chatgpt";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
const port = process.env.PORT ? process.env.PORT : 8765;

const chat_log = new Map();

let start = Date.now();

console.log("starting:", start);

function clearMap() {
  const millis = Date.now() - start;
  if (Math.floor(millis / 1000) > 60 * 5) {
    chat_log.clear();

    start = Date.now();

    console.log("chat log reloaded!");
  }
}

const openai = new ChatGPTUnofficialProxyAPI({
  accessToken: process.env.OPENAI_ACCESS_TOKEN,
  apiReverseProxyUrl: "https://bypass.churchless.tech/api/conversation",
});

async function askAI(question, userId) {
  const userLog = chat_log.get(userId) ? chat_log.get(userId) : undefined;

  const systemMessage = `You are ChatGPT, a large language model trained by OpenAI. You answer as concisely as possible for each responseIf you are generating a list, do not have too many items.
Current date: ${new Date().toISOString()}\n\n`;

  const completion = userLog
    ? await openai.sendMessage(question, {
        systemMessage,
        ...userLog,
      })
    : await openai.sendMessage(question, {
        systemMessage,
      });

  const answer = completion.text;

  // console.log(answer);

  if (answer) {
    clearMap();
    chat_log.set(userId, {
      parentMessageId: completion.parentMessageId,
      conversationId: completion.conversationId,
    });
  }

  return answer.replace("\n\n", "");
}

app.get("/", (req, res) => {
  res.send("Hello ChatGPT!");
});

app.get("/chat/:userId/:message", (req, res) => {
  if (req.params.message && req.params.userId) {
    askAI(req.params.message, req.params.userId)
      .then((reply) => res.send({ reply }))
      .catch((err) => console.log(err));
  } else {
    res.send({ reply: "ChatGPT error..." });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

