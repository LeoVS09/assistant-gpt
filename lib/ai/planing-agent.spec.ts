import { jest, describe, it, expect } from '@jest/globals';


import { extractCommandsAfterRetry } from "./planing-agent";

describe('extractCommandsAfterRetry', () => {
    it('extract real result from text after given separator', () => {
        const separator = ':-%'
        const textWithSeparator = 'Result:-% Success '

        expect(extractCommandsAfterRetry(separator, textWithSeparator)).toBe('Success')


    })

    it('throw error if cannot extract', () => {
        const separator = ':-%'
        const textWithoutSeparator = 'Failed to retrieve result'


        expect(() => { extractCommandsAfterRetry(separator, textWithoutSeparator) })
            .toThrow(`Cannot find separator '${separator}' in text '${textWithoutSeparator}'`)
    })

})