import { String } from "aws-sdk/clients/acm"
import { ChatMessage, SendMessageOptions } from "chatgpt"
import { api } from "./api"
import { validJsonObject } from "./json-validator"
import { generatePromptToFixJsonError } from "./prompt"
import { retry } from "./retry"

export interface GenerateCommandsOptions extends SendMessageOptions {
    prompt: String
}


export const generateCommandsWithRetry = async ({prompt, ...rest}: GenerateCommandsOptions) => retry<ChatMessage>(
    async (res, error) => {
        if(!res) {
            // No errors, initial call
            return await generateCommands({
                ...rest,
                prompt
            })
        }

        // Ouput probably was not valid json
        const promptToFixError = generatePromptToFixJsonError(error)

        return await generateCommands({
            ...rest,
            prompt: promptToFixError,
            parentMessageId: res.id
        })
    },
    (res) => validJsonObject(res.text)
)

export async function generateCommands({prompt, ...rest}: GenerateCommandsOptions) {
    const res = await api.sendMessage(prompt, {
        ...rest,
        // onProgress: (partialResponse) => console.debug(partialResponse.text)
    })

    console.log(`- User: ${prompt}\n-Assistant: ${res.text}\n`)

    return res
}




