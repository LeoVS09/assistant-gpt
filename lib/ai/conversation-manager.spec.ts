import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { ChatGPTAPI, ChatMessage, SendMessageOptions } from "chatgpt";
import { AiAgent, ConversationManager, ConversationMessage } from './conversation-manager';


describe('ConversationManager', () => {
    let mockedAiAgent: AiAgent = {
        sendMessage: jest.fn(() => Promise.resolve({} as ChatMessage)),
    } as AiAgent;

    let conversationManager = new ConversationManager(mockedAiAgent);
    let conversationId = conversationManager.conversationId;

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('send', () => {
        it('should successfully send message to chat agent', async () => {
            const onProgress = () => { }
            const message: ConversationMessage = {
                text: 'Hello, how are you?',
                name: 'Sara',
                onProgress,
            };
            const chatMessage = {
                id: '1',
                text: 'Hi, I am doing well. Thank you for asking.',
            } as ChatMessage;

            mockedAiAgent.sendMessage = jest.fn(() => Promise.resolve(chatMessage));

            const result = await conversationManager.send(message);

            expect(mockedAiAgent.sendMessage).toHaveBeenCalledWith('Hello, how are you?', {
                name: 'Sara',
                onProgress,
                conversationId,
                parentMessageId: undefined,
            });
            expect(result).toBe(chatMessage);
            expect(conversationManager.previusMessageId).toBe(chatMessage.id);
        });

        it('should successfully send second message to chat agent', async () => {
            const onProgress = () => { }
            const message: ConversationMessage = {
                text: 'How you work?',
                name: 'Leo',
                onProgress,
            };
            const chatMessage = {
                id: '2',
                text: 'Very good.',
            } as ChatMessage;

            mockedAiAgent.sendMessage = jest.fn(() => Promise.resolve(chatMessage));

            const result = await conversationManager.send(message);

            expect(mockedAiAgent.sendMessage).toHaveBeenCalledWith('How you work?', {
                name: 'Leo',
                onProgress,
                conversationId,
                parentMessageId: '1',
            });
            expect(result).toBe(chatMessage);
            expect(conversationManager.previusMessageId).toBe(chatMessage.id);
        });
    });
});