# openai-telegram-bot

openai telegram bot for private messages &amp; groups

## Notice

The bot using two kinds of APIs from OpenAPI official & chatGPT web api.

`index.js` for OpenAPI official api —— reliable but expensive.

`chat.js` for chatGPT web api —— free but slow & can get to network issues.

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
