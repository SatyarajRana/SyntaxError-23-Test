const OpenAI = require("openai");
const env = require("dotenv").config();

const { Configuration, OpenAIApi } = OpenAI;

const configuration = new Configuration({
  organization: process.env.OPENAI_ORGANIZATION_KEY,
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

var openAiConfig = {
  model: "text-davinci-003",
  max_tokens: 100,
  temperature: 0.5,
  n: 1,
};
async function getHints(Question) {
  const ans = await openai.createCompletion({
    // prompt: ` give me a `+ difficulty +` clue about ` + Question + `without using the word ` + Question,
    prompt:
      `give me 3 clues about ` +
      Question +
      ` with increasing difficuly and without using the word ` +
      Question,
    ...openAiConfig,
  });

  var separateLines = ans.data.choices[0].text;

  return separateLines;
}

async function askGPT(question) {
  const answer = await getHints(question);

  //Here answer is an array containing hints at index = 2,4,and 6
  return answer;
}
module.exports = {
  askGPT,
};
