import {jest, describe, it, expect} from '@jest/globals';

import { generateCommands, generateCommandsWithRetry } from "./generate-commands";
import { validJsonObject } from "./json-validator";
import { generateSystemPrompt } from "./prompt";
import { genIsValid } from "./retry";

const isValidJsonObject = genIsValid(validJsonObject)

const now = 'Tue Apr 04 2023'
console.log('assume for tests current date is', now)

const SECONDS = 1000;
jest.setTimeout(70 * SECONDS)


describe('generateCommands', () => {


  const systemMessage = generateSystemPrompt(now)

  const prompts = [
    'Need work on taxes this week',
    'What to read this month?',
  ]

  for (const prompt of prompts) {

    it(`should correctly answer on '${prompt}'`, async () => {
      const res = await generateCommands({systemMessage, prompt})
    
      expect([
        {'system': systemMessage},
        {'user': prompt},
        {'assistant': res.text}
      ]).toMatchSnapshot();
    });
    
  }
    
});


describe('generateCommandsWithRetry', () => {

  const systemMessage = generateSystemPrompt(now)

  const prompts = [
    'What to read this month?',
  ]

  for (const prompt of prompts) {

    it(`should answer valid json on '${prompt}'`, async () => {
      const res = await generateCommandsWithRetry({systemMessage, prompt})

      expect([
        {'system': systemMessage},
        {'user': prompt},
        {'assistant': res.text}
      ]).toMatchSnapshot();
      const { isValid } = isValidJsonObject(res.text)
      expect(isValid).toBeTruthy();
    });
    
  }
    
});