import { BingAIClient } from "@waylaidwanderer/chatgpt-api";

dotenv.config();

const bingAIClient = new BingAIClient({
  userToken: process.env.BING_TOKEN, // "_U" cookie from bing.com
  debug: false,
});

let response = await bingAIClient.sendMessage("Write a short poem about cats", {
  onProgress: (token) => {
    process.stdout.write(token);
  },
});
console.log(response);

response = await bingAIClient.sendMessage("Now write it in French", {
  conversationSignature: response.conversationSignature,
  conversationId: response.conversationId,
  clientId: response.clientId,
  invocationId: response.invocationId,
  onProgress: (token) => {
    process.stdout.write(token);
  },
});
console.log(response);
