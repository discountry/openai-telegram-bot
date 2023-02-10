import { ChatGPTAPI } from "chatgpt";
import dotenv from "dotenv";
import { marked } from "marked";
import { Telegraf } from "telegraf";

dotenv.config();

let conversation = null;

let start = Date.now();

console.log("starting:", start);

const api = new ChatGPTAPI({
  apiKey: process.env.APIKEY,
});

const bot = new Telegraf(process.env.TOKEN);

bot.start((ctx) => {
  ctx.reply(
    "Hello, this is a bot that uses OpenAI.\nAsk anything using /ask followed by your question, if your directly texting the bot you don't need to use /ask, just ask your question."
  );
});

async function askAI(question, userId) {
  conversation = conversation
    ? await api.sendMessage(question, {
        conversationId: conversation.conversationId,
        parentMessageId: conversation.messageId,
      })
    : await api.sendMessage(question);

  console.log(conversation.text);

  return conversation.text;
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
