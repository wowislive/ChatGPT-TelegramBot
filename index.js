const { Telegraf } = require("telegraf");
const { Configuration, OpenAIApi } = require("openai");
const axios = require("axios"); // HTTP client for JavaScript
const text = require("./const");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// displays a list of available commands with explanations
bot.help((ctx) => ctx.reply(text.commands));

const allowedUsers = ["470471049", "6184961493"];
const allowedChats = ["-926114543", "470471049", "6184961493"];

const restrictedToChat = (ctx, next) => {
  try {
    if (allowedChats.includes(ctx.chat.id.toString())) {
      return next();
    }
    return ctx.reply("I'm sorry, this bot is not available in your chat.");
  } catch (error) {
    console.log(error);
  }
};

const restrictedToUser = (ctx, next) => {
  try {
    if (allowedUsers.includes(ctx.from.id.toString())) {
      return next();
    }
    return ctx.reply("I'm sorry, you don't have access to this bot.");
  } catch (error) {
    console.log(error);
  }
};

// apply middleware to restrict access to all commands and events of the bot (for users)
//bot.use(restrictedToUser);
// apply middleware to restrict access to all commands and events of the bot (for chats)
bot.use(restrictedToChat);

// this function interacts with Apps Script and returns a response from the spreadsheet
const postToAppsScript = async (inputString, userId) => {
  try {
    const scriptUrl = process.env.APPS_SCRIPT;
    const response = await axios.post(scriptUrl, { inputString, userId });
    const result = response.data;
    return result;
  } catch (error) {
    console.error("Script execution error: ", error);
  }
};

// this is a function with a request to OpenAI, which returns a response
const getResponse = (user_text) => {
  try {
    return openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: user_text.slice(5),
        },
      ],
      temperature: 1,
    });
  } catch (error) {
    console.log(error);
  }
};

// function for handling bot communication with openai, requests chat history/sends to OpenAI/saves modified history
const handleConversationHistory = async (user_input, userId) => {
  try {
    let conversationHistory = await postToAppsScript(
      `USER: ${user_input}\n`,
      userId
    );
    response = await getResponse(conversationHistory);
    await postToAppsScript(
      `${response.data.choices[0].message.content}\n`,
      userId
    );
    return response;
  } catch (error) {
    console.log(error);
  }
};

// checking if the request after the command is empty or not
const isEmptyChat = async (command, ctx) => {
  try {
    const regex = new RegExp(`^${command}(\\s*)$`);

    if (regex.test(ctx.message.text)) {
      const msg = await ctx.reply(
        `To communicate with ChatGPT 3.5, enter your message after ${command} with a space, for example, "${command} Hello, how are you?"`
      );
      // pause to allow reading the message report, then it will be deleted
      setTimeout(async () => {
        await ctx.deleteMessage(msg.message_id);
        await ctx.deleteMessage(ctx.message.message_id);
      }, 5000);
      return false;
    } else {
      return true;
    }
  } catch (error) {
    console.log(error);
  }
};

// command for communicating with ChatGPT in chat format
bot.command("ask", async (ctx) => {
  try {
    if (await isEmptyChat("/ask", ctx)) {
      // message about waiting for a response from ChatGPT
      const responseSticker = await ctx.replyWithSticker(text.awaitSticker, {
        reply_to_message_id: ctx.message.message_id,
      });
      const responsePhrase = await ctx.reply("Processing the request...");
      // retrieving the text message from the user
      const user_text = ctx.message.text;

      // sending a request to the ChatGPT 3.5 Turbo API and receiving a response
      const response = await handleConversationHistory(
        user_text.slice(5),
        ctx.from.id.toString()
      );

      await ctx.deleteMessage(responseSticker.message_id);
      await ctx.deleteMessage(responsePhrase.message_id);

      await ctx.reply(`${response.data.choices[0].message.content}`, {
        reply_to_message_id: ctx.message.message_id,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

// command for communicating with ChatGPT in chat format with conversation history clearing
bot.command("asknew", async (ctx) => {
  try {
    if (await isEmptyChat("/asknew", ctx)) {
      const responseSticker = await ctx.replyWithSticker(text.awaitSticker, {
        reply_to_message_id: ctx.message.message_id,
      });
      const responsePhrase = await ctx.reply("Processing the request...");

      // clearing chat history
      await postToAppsScript("reset", ctx.from.id.toString());

      const user_text = ctx.message.text;

      const response = await handleConversationHistory(
        user_text.slice(8),
        ctx.from.id.toString()
      );

      await ctx.deleteMessage(responseSticker.message_id);
      await ctx.deleteMessage(responsePhrase.message_id);

      await ctx.reply(`${response.data.choices[0].message.content}`, {
        reply_to_message_id: ctx.message.message_id,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

// clearing the chat history to start a dialogue from scratch. Saving tokens
bot.command("reset", async (ctx) => {
  try {
    const responseSticker = await ctx.replyWithSticker(text.awaitSticker, {
      reply_to_message_id: ctx.message.message_id,
    });
    const responsePhrase = await ctx.reply("Processing the request...");

    // clearing chat history
    await postToAppsScript("reset", ctx.from.id.toString());

    await ctx.deleteMessage(responseSticker.message_id);
    await ctx.deleteMessage(responsePhrase.message_id);
    const msg = await ctx.reply(
      "The message history has been cleared. You can start a new one"
    );
    // pause to allow reading the message report, then it will be deleted
    setTimeout(async () => {
      await ctx.deleteMessage(msg.message_id);
      await ctx.deleteMessage(ctx.message.message_id);
    }, 3000);
  } catch (error) {
    console.log(error);
  }
});

//uncomment this code instead of bot.launch() in AWS lambda function
/*
exports.handler = (event, context, callback) => {
  bot.handleUpdate(JSON.parse(event.body));
  return callback(null, {
    statusCode: 200,
    body: '',
  });
};
*/

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
