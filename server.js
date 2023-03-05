import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
const port = process.env.PORT ? process.env.PORT : 8080;

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

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.APIKEY,
  })
);

async function askAI(question, userId) {
  const userLog = chat_log.get(userId) ? chat_log.get(userId) : [];

  const promptionList = [...userLog, { role: "user", content: question }];

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: promptionList,
  });

  const answer = completion.data.choices[0].message;

  // console.log(answer);

  if (answer) {
    clearMap();
    chat_log.set(userId, [...promptionList, answer]);
  }

  return answer.content;
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
