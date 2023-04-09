import { ChatGPTAPI } from 'chatgpt'
import { AiAgent } from './conversation-manager'


/** Generate AI Agent instance which able perform chat completition */
export const generateAiAgent = (): AiAgent => {
    console.log('env OPENAI_API_KEY is exists', !!process.env.OPENAI_API_KEY)

    return new ChatGPTAPI({
        apiKey: process.env.OPENAI_API_KEY!,
        completionParams: {
            model: "gpt-3.5-turbo",
            temperature: 0.2 // based on https://arxiv.org/pdf/2303.17580.pdf
        }
    
    })
}