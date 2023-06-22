//import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai"

//const configuration = new Configuration({
//  organization: "org-qEhpZInvhW1XpV73wvJMhHRb",
//  apiKey: import.meta.env.VITE_OPENAI_API_KEY
//})
//const openai = new OpenAIApi(configuration)

import { ReflectionRequest } from "../../../OmnisGPT/omnis-gpt/bindings/ReflectionRequest"
import { ChatMessage } from "../../../OmnisGPT/omnis-gpt/bindings/ChatMessage"
import { Role } from "../../../OmnisGPT/omnis-gpt/bindings/Role"
import { ReflectionResponse } from "../../../OmnisGPT/omnis-gpt/bindings/ReflectionResponse"

export async function reflection(messages: ChatMessage[]) {

  let request: ReflectionRequest = {
    messages
  }

  let response = await fetch(import.meta.env.VITE_OMNIS_GPT_ADDR + "/reflection", {
    body: JSON.stringify(request),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })


  let json: ReflectionResponse = await response.json()
  if (json.error) {
    return {data: null, error: json.error}
  }  else if (json.message === null) {
    return {data: null, error: null}
  }

  let newMessages = messages.slice()
  newMessages.push(json.message)

  return {data: newMessages, error: null}

}
