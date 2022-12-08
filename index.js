import dotenv from "dotenv";
import { marked } from "marked";
import { Configuration, OpenAIApi } from "openai";
import { Telegraf } from "telegraf";

dotenv.config();

const start_sequence = "\nAI:";
const restart_sequence = "\nHuman:";

const chat_log = new Map();

let start = Date.now();

console.log("starting:", start);

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.APIKEY,
  })
);
const bot = new Telegraf(process.env.TOKEN);

function clearMap() {
  const millis = Date.now() - start;
  if (Math.floor(millis / 1000) > 60 * 5) {
    chat_log.clear();

    start = Date.now();

    console.log("chat log reloaded!");
  }
}

bot.start((ctx) => {
  ctx.reply(
    "Hello, this is a bot that uses OpenAI.\nAsk anything using /ask followed by your question, if your directly texting the bot you don't need to use /ask, just ask your question."
  );
});

async function askAI(question, userId) {
  const userLog = chat_log.get(userId) ? chat_log.get(userId) : "";

  const promption = `${userLog}${restart_sequence}${question}${start_sequence}`;

  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: promption,
    max_tokens: 2500,
    temperature: 0.7,
    stop: [" Human:", " AI:"],
  });

  const answer = completion.data.choices[0].text;

  if (answer) {
    clearMap();
    chat_log.set(userId, `${promption}${answer}`);
  }

  return answer;
}

async function generateImage(prompt) {
  return await openai.createImage({
    prompt: prompt,
    n: 1,
    size: "1024x1024",
  });
}

async function editRequest(prompt) {
  const response = await openai.createEdit({
    model: "text-davinci-edit-001",
    input: prompt,
    instruction: "Fix the spelling and grammer mistakes",
  });

  const fix = response.data.choices[0].text;

  return fix;
}

bot.command("ask", async (ctx) => {
  const userId = ctx.update.message.from.id;

  if (ctx.update.message.from.is_bot) {
    return false;
  }

  const args = ctx.update.message.text.split(" ");
  args.shift();
  let question = args.join(" ");

  if (question.length == 0) {
    return ctx.reply("Type something after /ask to ask me stuff.", {
      reply_to_message_id: ctx.message.message_id,
    });
  }

  ctx.sendChatAction("typing");

  try {
    const completion = await askAI(question, userId);

    ctx.reply(marked.parseInline(completion), {
      reply_to_message_id: ctx.message.message_id,
      parse_mode: "HTML",
    });
  } catch (error) {
    console.log(error);
  }
});

bot.command("image", async (ctx) => {
  if (ctx.update.message.from.is_bot) {
    return false;
  }

  const args = ctx.update.message.text.split(" ");
  args.shift();
  let question = args.join(" ");

  if (question.length == 0) {
    return ctx.reply("Type something after /image to get a pic.", {
      reply_to_message_id: ctx.message.message_id,
    });
  }

  ctx.sendChatAction("typing");

  try {
    const response = await generateImage(question);

    ctx.replyWithPhoto(response.data.data[0].url, question);
  } catch (error) {
    console.log(error);
  }
});

bot.command("fix", async (ctx) => {
  if (ctx.update.message.from.is_bot) {
    return false;
  }

  const args = ctx.update.message.text.split(" ");
  args.shift();
  let question = args.join(" ");

  if (question.length == 0) {
    return ctx.reply("Type something after /fix to correct your text.", {
      reply_to_message_id: ctx.message.message_id,
    });
  }

  ctx.sendChatAction("typing");

  try {
    const completion = await editRequest(question);

    ctx.reply(marked.parseInline(completion), {
      reply_to_message_id: ctx.message.message_id,
      parse_mode: "HTML",
    });
  } catch (error) {
    console.log(error);
  }
});

bot.command("reload", async (ctx) => {
  chat_log.clear();

  ctx.sendChatAction("typing");

  if (chat_log.size === 0) {
    return ctx.reply("Conversation history reloaded!", {
      reply_to_message_id: ctx.message.message_id,
    });
  }
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
