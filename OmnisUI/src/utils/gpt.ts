import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai"

const configuration = new Configuration({
  organization: "org-qEhpZInvhW1XpV73wvJMhHRb",
  apiKey: import.meta.env.VITE_OPENAI_API_KEY
})
const openai = new OpenAIApi(configuration)


export async function reflection(messages: ChatCompletionRequestMessage[]) {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages,
    temperature: 1

  })


  let newMessage = response.data.choices[0].message!

  let newMessages = messages.slice()
  newMessages.push(newMessage)

  return newMessages
}
