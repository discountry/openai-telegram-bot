const { Telegraf } = require("telegraf");
const { Configuration, OpenAIApi } = require("openai");
const { marked } = require("marked");
const config = require("./config");

const start_sequence = "\nAI:";
const restart_sequence = "\nHuman:";

let chat_log = {};

const openai = new OpenAIApi(
  new Configuration({
    apiKey: config.apiKey,
  })
);
const bot = new Telegraf(config.token);

bot.start((ctx) => {
  ctx.reply(
    "Hello, this is a bot that uses OpenAI.\nAsk anything using /ask followed by your question, if your directly texting the bot you don't need to use /ask, just ask your question."
  );
});

async function askAI(question, userId) {
  const userLog = chat_log.hasOwnProperty(userId) ? chat_log[userId] : "";

  const completion = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `${userLog}${restart_sequence}${question}${start_sequence}`,
    max_tokens: 1000,
    temperature: 0.7,
    stop: [" Human:", " AI:"],
  });

  const answer = completion.data.choices[0].text;

  if (answer) {
    chat_log[userId] = `${chat_log[userId]}${restart_sequence}${question}${start_sequence}${answer}`;
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

  ctx.replyWithChatAction("typing");

  const completion = await askAI(question, userId);

  ctx.reply(marked.parseInline(completion), {
    reply_to_message_id: ctx.message.message_id,
    parse_mode: "HTML",
  });
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

  ctx.replyWithChatAction("typing");

  const response = await generateImage(question);

  ctx.replyWithPhoto(response.data.data[0].url, question);
});

bot.command("reload", async (ctx) => {
  chat_log = {};

  ctx.replyWithChatAction("typing");

  if (chat_log === "") {
    return ctx.reply("Conversation history reloaded!", {
      reply_to_message_id: ctx.message.message_id,
    });
  }
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
