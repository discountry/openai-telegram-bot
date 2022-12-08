# openai-telegram-bot

openai telegram bot for private messages &amp; groups

## Notice

The bot using two kinds of APIs from OpenAPI official & chatGPT web api.

`index.js` for OpenAPI official api —— reliable but expensive.

`chat.js` for chatGPT web api —— free but slow & can get to network issues.

## Usage

```bash
git clone https://github.com/discountry/openai-telegram-bot.git
cd openai-telegram-bot

npm i

cp example.config.js config.js

# edit config.js with your token and api key
vim config.js

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
