const { Telegraf } = require("telegraf");
const { ChatGPTAPI } = require("chatgpt");
const { marked } = require("marked");
const config = require("./config");

const chat_log = new Map();

let start = Date.now();

console.log("starting:", start);

const chatgpt = new ChatGPTAPI({
  sessionToken: config.session
})

const bot = new Telegraf(config.token);

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
  // ensure the API is properly authenticated
  await chatgpt.ensureAuth()

  const conversation = chat_log.get(userId) ? chat_log.get(userId) : chatgpt.getConversation();

  const answer = await conversation.sendMessage(question);

  if (answer) {
    clearMap();
    chat_log.set(userId, conversation);
  }

  return answer;
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
