import { ChatGPTAPI } from 'chatgpt'
import { generateSystemPrompt } from './prompt'

console.log('process.env.OPENAI_API_KEY', process.env.OPENAI_API_KEY)

const now = new Date().toDateString()
console.log('current date', now)

const api = new ChatGPTAPI({
    apiKey: process.env.OPENAI_API_KEY!,
    completionParams: {
        model: "gpt-3.5-turbo",
        temperature: 0.2 // based on https://arxiv.org/pdf/2303.17580.pdf
    }

})

export async function generateTasks(prompt: string) {
    const res = await api.sendMessage(prompt, {
        systemMessage: generateSystemPrompt(now)
    })

    return res
}

async function example() {

    const prompts = [
        'Need work on taxes this week',
        'What to read this month?',
    ]

    for (const prompt of prompts) {
        const res = await generateTasks(prompt)
        console.log(`- User: ${prompt}\n-Tasks: ${res.text}\n`)
    }
}

example()