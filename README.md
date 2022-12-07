# openai-telegram-bot

openai telegram bot for private messages &amp; groups

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
