# openai-telegram-bot

openai telegram bot for private messages &amp; groups

## Update 2023/03/02

Try new official chatgpt api [doc](https://platform.openai.com/docs/guides/chat):

It's 1/10 cheaper than `text-davinci-003` model.

```bash
# run this command and wait for the browser window.
node turbo.js
```

## Notice

The bot using two kinds of APIs from OpenAPI official & chatGPT web api.

`liveChat.js` for simulating the chatgpt website live reply in telegram.

`turbo.js` for newest `gpt-3.5` official chatgpt API.

`index.js` for OpenAPI official api using `text-davinci-003` model —— reliable but expensive.

`chat.js` for reverse engineered chatGPT web api —— free but slow & may get to network issues.

`server.js` turn chatGPT into your own api service.

## Usage

```bash
git clone https://github.com/discountry/openai-telegram-bot.git
cd openai-telegram-bot

npm i

cp .env.example .env

# edit .env with your token and api key
vim .env

# test
node index.js

# run in background
npm install -g pm2

pm2 start index.js
```

`chat.js`

```bash
# test
node chat.js

# use chatgpt api when you run out of money
pm2 start chat.js
```

`server.js`

```bash
# test
node server.js

# use chatgpt api as a web service that you can access from url
pm2 start server.js

# goto http://localhost/chat/:userId/:message example: http://localhost/chat/1/hello
```

# Interactions

**/ask**

ask normal questions or let the bot write code for you.

```
/ask how old are you
```

**/fix**

get grammer and typo fix.

```
/fix he am dgo
```

**/image**

get image reply from dalle2 model.

```
/image doge with twitter to the moon
```

**/reload**

reload chat history. The bot will forget everything.

```
/reload
```
