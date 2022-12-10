import { ChatGPTAPI } from "chatgpt";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
const port = process.env.PORT ? process.env.PORT : 80;

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

// sessionToken is required; see below for details
const chatgpt = new ChatGPTAPI({
  sessionToken: process.env.SESSION_TOKEN,
});

async function askAI(question, userId) {
  // ensure the API is properly authenticated
  await chatgpt.ensureAuth();

  console.log(userId, question);

  console.log(chat_log);

  const conversation = chat_log.get(userId)
    ? chat_log.get(userId)
    : chatgpt.getConversation();

  const answer = await conversation.sendMessage(question);

  if (answer) {
    clearMap();
    chat_log.set(userId, conversation);
  }

  return answer;
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
