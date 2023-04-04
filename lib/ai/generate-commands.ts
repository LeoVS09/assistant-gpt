import { api } from "./api"

export async function generateCommands(systemMessage: string, prompt: string) {
    const res = await api.sendMessage(prompt, {
        systemMessage
    })

    return res
}

