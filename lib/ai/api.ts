import { ChatGPTAPI } from 'chatgpt'

console.log('env OPENAI_API_KEY is exists', !!process.env.OPENAI_API_KEY)

export const api = new ChatGPTAPI({
    apiKey: process.env.OPENAI_API_KEY!,
    completionParams: {
        model: "gpt-3.5-turbo",
        temperature: 0.2 // based on https://arxiv.org/pdf/2303.17580.pdf
    }

})