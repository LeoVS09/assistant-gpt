import { ChatGPTAPI } from 'chatgpt'

console.log('process.env.OPENAI_API_KEY', process.env.OPENAI_API_KEY)

async function example() {
  const api = new ChatGPTAPI({
    apiKey: process.env.OPENAI_API_KEY!,
    completionParams: {
        model: "gpt-3.5-turbo",
        temperature: 0.2 // based on https://arxiv.org/pdf/2303.17580.pdf
    }
    
  })

  const res = await api.sendMessage('Hello World!')
  console.log(res.text)

  return res.text
}

example()