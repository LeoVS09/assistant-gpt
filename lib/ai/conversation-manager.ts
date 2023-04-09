import { ChatGPTAPI, ChatMessage, SendMessageOptions } from "chatgpt";
import { v4 as uuidv4 } from 'uuid'

/** Message in chat which is sent to AI Agent */
export interface ConversationMessage extends Pick<SendMessageOptions, 'name' | 'onProgress' | 'systemMessage'> {
    text: string
}

/**
 * Interface for AiApi class. Real implementation is in chatgpt/ChatGPTAPI
 */
export interface AiAgent {
    /**
     * Sends a message to the AI agent and receives a response.
     *
     * @param message The message to send.
     * @param options Additional options for sending the message.
     *
     * @returns The response message from the AI agent.
     */
    sendMessage(message: string, options?: SendMessageOptions): Promise<ChatMessage>;
  }
  

/** Manager which maintain persistant conversation with AI Agent */
export class ConversationManager {

    public conversationId = uuidv4()
    public previusMessageId?: string

    constructor(
        private readonly aiAgent: AiAgent,
    ) { 
        // TODO: restore and save conversation into persistent storage
    }

    public async send({text, ...rest}: ConversationMessage): Promise<ChatMessage> {
        const res = await this.aiAgent.sendMessage(text, {
            ...rest,
            conversationId: this.conversationId,
            parentMessageId: this.previusMessageId,
        })

        console.debug(`- User: ${text}\n-Assistant: ${res.text}\n`)

        this.previusMessageId = res.id

        return res;
    }
}