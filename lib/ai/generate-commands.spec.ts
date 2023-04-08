import {jest, describe, it, expect} from '@jest/globals';
import { DateTime } from 'luxon';

import { extractCommandsAfterRetry, generateCommands, generateCommandsWithRetry } from "./generate-commands";
import { validJsonObject } from "./json-validator";
import { generateSystemPrompt } from "./prompt";
import { genIsValid } from "./retry";


const isValidJsonObject = genIsValid(validJsonObject)

const now = DateTime.fromJSDate(new Date('Tue Apr 04 2023'))
console.log('assume for tests current date is', now)

const SECONDS = 1000;
jest.setTimeout(70 * SECONDS)


describe('extractCommandsAfterRetry', () => {
  it('extract real result from text after given separator', () => {
    const separator = ':-%'
    const textWithSeparator = 'Result:-% Success '

    expect(extractCommandsAfterRetry(separator, textWithSeparator)).toBe('Success')
    
    
})

it('throw error if cannot extract', () => {
  const separator = ':-%'
  const textWithoutSeparator = 'Failed to retrieve result'

  
  expect(() => {extractCommandsAfterRetry(separator, textWithoutSeparator)})
  .toThrow(`Cannot find separator '${separator}' in text '${textWithoutSeparator}'`)
})

})

describe('generateCommands', () => {


  const systemMessage = generateSystemPrompt(now)

  const prompts = [
    'Need work on taxes this week',
    'What to read this month?',
  ]

  for (const prompt of prompts) {

    it(`should correctly answer on '${prompt}'`, async () => {
      const res = await generateCommands({systemMessage, date: now, prompt})
    
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
      const res = await generateCommandsWithRetry({systemMessage, date: now, prompt})

      expect([
        {'system': systemMessage},
        {'user': prompt},
        {'assistant': res.text}
      ]).toMatchSnapshot();
      const { isValid } = isValidJsonObject(res.text)
      expect(isValid).toBeTruthy();
    });
    
  }

  it(`should answer save command on 'Need read book "Domain-Driven Design: Tackling Complexity in the Heart of Software" this month`, async () => {
    const prompt = 'Need read book "Domain-Driven Design: Tackling Complexity in the Heart of Software" this month'
    const res = await generateCommandsWithRetry({systemMessage, date: now, prompt })

    expect([
      {'system': systemMessage},
      {'user': prompt},
      {'assistant': res.text}
    ]).toMatchSnapshot();

    const { isValid } = isValidJsonObject(res.text)
    expect(isValid).toBeTruthy();

    const { commands, response } = JSON.parse(res.text)
    expect(commands).toHaveLength(1)
    expect(response).toBeDefined()

    const [command] = commands
    expect(command.id).toBe('save')
    expect(command.args.text).toBeDefined()
    expect(command.args.entities).toContain('Domain-Driven Design: Tackling Complexity in the Heart of Software')
    expect(command.args.tags.join(' ')).toContain('read')
    expect(command.args.status).toContain('to-do')
    expect(command.args.deadline).toBe(now.endOf('month').toLocaleString(DateTime.DATE_FULL))
  });

  it(`should answer save command on 'Need work on taxes this week'`, async () => {
    const prompt = 'Need work on taxes this week'
    const res = await generateCommandsWithRetry({systemMessage, date: now, prompt })

    expect([
      {'system': systemMessage},
      {'user': prompt},
      {'assistant': res.text}
    ]).toMatchSnapshot();

    const { isValid } = isValidJsonObject(res.text)
    expect(isValid).toBeTruthy();

    const { commands, response } = JSON.parse(res.text)
    expect(commands).toHaveLength(1)
    expect(response).toBeDefined()

    const [command] = commands
    expect(command.id).toBe('save')
    expect(command.args.text).toBe(prompt)
    expect(command.args.entities).toContain('taxes')
    expect(command.args.tags.join(' ')).toContain('work')
    expect(command.args.status).toContain('to-do')
    expect(command.args.deadline).toBe(now.endOf('week').toLocaleString(DateTime.DATE_FULL))
  });

  it(`should answer save command on 'Why the sun looks yellow?'`, async () => {
    const prompt = 'Why the sun looks yellow?'
    const res = await generateCommandsWithRetry({systemMessage, date: now, prompt })

    expect([
      {'system': systemMessage},
      {'user': prompt},
      {'assistant': res.text}
    ]).toMatchSnapshot();
    
    const { isValid } = isValidJsonObject(res.text)
    expect(isValid).toBeTruthy();

    const { commands, response } = JSON.parse(res.text)
    expect(commands || []).toHaveLength(0)
    expect(response).toBeDefined()

  });

  it(`should answer query command on "What to read this month?"`, async () => {
    const prompt = 'What to read this month?'
    const res = await generateCommandsWithRetry({systemMessage, date: now, prompt })

    expect([
      {'system': systemMessage},
      {'user': prompt},
      {'assistant': res.text}
    ]).toMatchSnapshot();

    const { isValid } = isValidJsonObject(res.text)
    expect(isValid).toBeTruthy();

    const { commands, response } = JSON.parse(res.text)
    expect(commands).toHaveLength(1)
    expect(response).toBeDefined()

    const [command] = commands
    expect(command.id).toBe('query')
    expect(command.args.status).toContain('to-do')
    expect(command.args.deadline).toEqual({ '$lte': now.endOf('month').toLocaleString(DateTime.DATE_FULL) })
  });

  it(`should answer update command on "I'm finished with taxes"`, async () => {
    const prompt = "I'm finished with taxes"
    const res = await generateCommandsWithRetry({systemMessage, date: now, prompt })

    expect([
      {'system': systemMessage},
      {'user': prompt},
      {'assistant': res.text}
    ]).toMatchSnapshot();

    const { isValid } = isValidJsonObject(res.text)
    expect(isValid).toBeTruthy();

    const { commands, response } = JSON.parse(res.text)
    expect(commands).toHaveLength(1)
    expect(response).toBeDefined()

    const [command] = commands
    expect(command.id).toBe('update')
    expect(command.args.filter).toBeDefined()
    expect(command.args.filter.entities).toBe('taxes')
    expect(command.args.filter.status).toBe('to-do')
    expect(command.args.update).toBeDefined()
    expect(command.args.update.$set.status).toBe('done')
  });
    
});