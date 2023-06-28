# ChatGPT Telegram Bot

This is a Telegram bot for interacting with ChatGPT 3.5. It allows you to have a dialogue with ChatGPT within the Telegram chat.

This is my test project, which uses Google Sheets to store the dialogue history. You can find the script for Google Apps Script in the `appsScript.gs` file. I will be further developing and expanding it.

To enable continuous communication with the bot, I am using AWS Lambda and Google Sheets as they are free. However, the OpenAI API comes with a cost and charges a small fee for interactions.

## Dependencies

```sh
npm init
```

```sh
npm install telegraf
```

```sh
npm install dotenv
```

```sh
npm install axios
```

```sh
npm install openai
```

## To do

- [ ] Resolve the issue of token limit overflow (shorten or clear history when it exceeds)
- [ ] Add token counting
- [ ] Replace Google Sheets/Apps Script with some database
