import { String } from "aws-sdk/clients/acm"
import { ChatMessage, SendMessageOptions } from "chatgpt"
import { api } from "./api"
import { validJsonObject } from "./json-validator"
import { generatePromptToFixJsonError } from "./prompt"
import { retry } from "./retry"
import { DateTime } from "luxon"

export interface GenerateCommandsOptions extends SendMessageOptions {
    prompt: String
    date: DateTime
}

export interface Commands {
    response: ChatMessage
    text: string
}

const appologySeparator = '%RESULT%'

export const generateCommandsWithRetry = async ({prompt, date, ...rest}: GenerateCommandsOptions) => retry<Commands>(
    async (commands, error) => {
        if(!commands) {
            // No errors, initial call
            const response = await generateCommands({prompt, date, ...rest})
            return { response, text: response.text }
        }

        // Ouput probably was not valid json
        const promptToFixError = generatePromptToFixJsonError(appologySeparator, date, error)

        const retryRes = await generateCommands({
            ...rest,
            date,
            prompt: promptToFixError,
            parentMessageId: commands.response.id
        })

        return { response: retryRes, text: extractCommandsAfterRetry(appologySeparator, retryRes.text) }
    },
    (res) => validJsonObject(res.text)
)

export async function generateCommands({prompt, ...rest}: GenerateCommandsOptions): Promise<ChatMessage> {
    const res = await api.sendMessage(prompt, {
        ...rest,
        // onProgress: (partialResponse) => console.debug(partialResponse.text)
    })

    console.log(`- User: ${prompt}\n-Assistant: ${res.text}\n`)

    return res
}

/** Extract real result from text after given separator */
export const extractCommandsAfterRetry = (separator: string, text: string) => {
    const index = text.lastIndexOf(separator)
    if(index === -1) {
        throw new Error(`Cannot find separator '${separator}' in text '${text}'`)
    }

    return text.slice(index + separator.length).trim()

}


