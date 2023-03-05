import { ChatGPTAPI } from "chatgpt";
import dotenv from "dotenv";
import { marked } from "marked";
import { Telegraf } from "telegraf";

dotenv.config();

const chat_log = new Map();

let start = Date.now();

console.log("starting:", start);

const openai = new ChatGPTAPI({
  apiKey: process.env.APIKEY,
});

const bot = new Telegraf(process.env.TOKEN);

bot.start((ctx) => {
  ctx.reply(
    "Hello, this is a bot that uses OpenAI.\nAsk anything using /ask followed by your question."
  );
});

function clearMap() {
  const millis = Date.now() - start;
  if (Math.floor(millis / 1000) > 60 * 5) {
    chat_log.clear();

    start = Date.now();

    console.log("chat log reloaded!");
  }
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
    const initReply = await ctx.reply(marked.parseInline(`ChatGPT... \n`), {
      reply_to_message_id: ctx.message.message_id,
      parse_mode: "HTML",
    });

    let currentMessage = "";
    let replyedMessage = "";

    const updateInterval = setInterval(async () => {
      if (currentMessage !== replyedMessage) {
        try {
          const editMessage = await ctx.telegram.editMessageText(
            ctx.chat.id,
            initReply.message_id,
            0,
            currentMessage
          );
          if (editMessage.message_id) {
            replyedMessage = currentMessage;
          }
        } catch (error) {
          console.log(error);
        }
      }
    }, 1000);

    openai
      .sendMessage(question, {
        // print the partial response as the AI is "typing"
        parentMessageId: chat_log.get(userId)
          ? chat_log.get(userId)
          : undefined,
        onProgress: (partialResponse) => {
          if (partialResponse.text.length > currentMessage.length) {
            currentMessage = partialResponse.text;
          }
        },
      })
      .then((res) => {
        if (res.text) {
          clearInterval(updateInterval);
          setTimeout(() => {
            try {
              ctx.telegram.editMessageText(
                ctx.chat.id,
                initReply.message_id,
                0,
                res.text
              );
            } catch (error) {
              console.log(error);
            }
          }, 1000);
          clearMap();
          chat_log.set(userId, res.id);
        }
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
