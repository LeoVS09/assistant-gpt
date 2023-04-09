import { ChatMessage } from "chatgpt"
import { errorToString, generatePromptToFixJsonError, generateSystemPrompt } from "./prompt"
import { retry } from "./retry"
import { DateTime } from "luxon"
import { ConversationManager, ConversationMessage } from "./conversation-manager"
import { AssistantOutput } from "./assistant-models"


export interface CommandsPlan extends AssistantOutput {
    original: ChatMessage
}



export class CommandsParsingError {
    constructor(
        public readonly message: ChatMessage,
        public readonly originalError: any,
    ) { }

    public toString() {
        return `Cannot parse commands, catched error '${errorToString(this.originalError)}'`
    }
}

/** Agent which plan commands based on user input text */
export class PlaningAgent {

    public systemMessage: string
    public appologySeparator = '%RESULT%'

    constructor(
        private readonly chat: ConversationManager,
        private readonly now: DateTime
    ) { 
        this.systemMessage = generateSystemPrompt(this.now)
    }

    public async plan(message: ConversationMessage): Promise<CommandsPlan> {
        return retry(
            async () => {
                // No errors, initial call
                const original = await this.chat.send({
                    ...message,
                    systemMessage: this.systemMessage,
                })
                
                try {
                    // TODO: add validation
                    const { response, commands } = JSON.parse(original.text) as AssistantOutput

                    return { original, response, commands }
                } catch (error) {
                    console.warn('Error during execution', error, 'for response', original.text)
                    throw new CommandsParsingError(original, error)
                }
            },
            async (error) => {
                if (!(error instanceof CommandsParsingError)) {
                    throw error
                }

                // Ouput probably was not valid json
                const retryRes = await this.chat.send({
                    ...message,
                    text: this.genPromptToFixJsonError(error.originalError),
                    systemMessage: this.systemMessage,
                })

                const commandsJson = this.extractCommandsAfterRetry(retryRes.text)
                const { response, commands } = JSON.parse(commandsJson) as AssistantOutput

                return { original: retryRes, response, commands }
            }
        )
    }

    private genPromptToFixJsonError(error: any) {
        return generatePromptToFixJsonError(this.appologySeparator, this.now, error)
    }

    private extractCommandsAfterRetry(text: string) {
        return extractCommandsAfterRetry(this.appologySeparator, text)
    }
}

/** Extract real result from text after given separator */
export const extractCommandsAfterRetry = (separator: string, text: string) => {
    const index = text.lastIndexOf(separator)
    if (index === -1) {
        throw new Error(`Cannot find separator '${separator}' in text '${text}'`)
    }

    return text.slice(index + separator.length).trim()

}


