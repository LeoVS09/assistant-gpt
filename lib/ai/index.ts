import { ChatGPTAPI } from 'chatgpt'
import { generateSystemPrompt } from './prompt'

console.log('process.env.OPENAI_API_KEY', process.env.OPENAI_API_KEY)

const now = new Date().toDateString()
console.log('current date', now)

export const SystemPrompt = generateSystemPrompt(now)

const api = new ChatGPTAPI({
    apiKey: process.env.OPENAI_API_KEY!,
    completionParams: {
        model: "gpt-3.5-turbo",
        temperature: 0.2 // based on https://arxiv.org/pdf/2303.17580.pdf
    }

})

export async function generateTasks(systemMessage: string, prompt: string) {
    const res = await api.sendMessage(prompt, {
        systemMessage
    })

    return res
}

