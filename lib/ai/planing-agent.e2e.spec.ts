import {jest, describe, it, expect} from '@jest/globals';
import { DateTime } from 'luxon';

import { PlaningAgent } from "./planing-agent";
import { ConversationManager } from './conversation-manager';
import { generateAiAgent } from './ai-agent';
import { QueryCommand, SaveCommandArgs, UpdateCommandArgs } from './assistant-models';

const SECONDS = 1000;
jest.setTimeout(70 * SECONDS)


describe('PlaningAgent', () => {
  const now = DateTime.fromJSDate(new Date('Tue Apr 04 2023'))
  console.log('assume for tests current date is', now.toLocaleString())

  const ai = generateAiAgent()
  const conversation = new ConversationManager(ai)

  const agent = new PlaningAgent(conversation, now);

  it(`should answer save command on 'Need read book "Domain-Driven Design: Tackling Complexity in the Heart of Software" this month`, async () => {
    const text = 'Need read book "Domain-Driven Design: Tackling Complexity in the Heart of Software" this month'
    
    const {original, commands, response} = await agent.plan({text: text})

    expect([
      {'system': agent.systemMessage},
      {'user': text},
      {'assistant': original.text}
    ]).toMatchSnapshot();

    expect(commands).toHaveLength(1)
    expect(response).toBeDefined()

    const [command] = commands!
    expect(command.id).toBe('save')

    const args = command.args as SaveCommandArgs
    expect(args.text).toBeDefined()
    expect(args.entities).toContain('Domain-Driven Design: Tackling Complexity in the Heart of Software')
    expect(args.tags?.join(' ')).toContain('read')
    expect(args.status).toContain('to-do')
    expect(args.deadline).toBe(now.endOf('month').toLocaleString(DateTime.DATE_FULL))
  });

  it(`should answer save command on 'Need work on taxes this week'`, async () => {
    const text = 'Need work on taxes this week'

    const {original, commands, response} = await agent.plan({text: text})

    expect([
      {'system': agent.systemMessage},
      {'user': text},
      {'assistant': original.text}
    ]).toMatchSnapshot();

    expect(commands).toHaveLength(1)
    expect(response).toBeDefined()

    const [command] = commands!
    expect(command.id).toBe('save')

    const args = command.args as SaveCommandArgs
    expect(args.text).toBeDefined()
    expect(args.entities).toContain('taxes')
    expect(args.tags?.join(' ')).toContain('work')
    expect(args.status).toContain('to-do')
    expect(args.deadline).toBe(now.endOf('week').toLocaleString(DateTime.DATE_FULL))
  });

  it(`should answer save command on 'Why the sun looks yellow?'`, async () => {
    const text = 'Why the sun looks yellow?'
    
    const {original, commands, response} = await agent.plan({text: text})

    expect([
      {'system': agent.systemMessage},
      {'user': text},
      {'assistant': original.text}
    ]).toMatchSnapshot();

    expect(commands || []).toHaveLength(0)
    expect(response).toBeDefined()

  });

  it(`should answer query command on "What to read this month?"`, async () => {
    const text = 'What to read this month?'

    const {original, commands, response} = await agent.plan({text: text})

    expect([
      {'system': agent.systemMessage},
      {'user': text},
      {'assistant': original.text}
    ]).toMatchSnapshot();

    expect(commands).toHaveLength(1)
    expect(response).toBeDefined()

    const [command] = commands!
    expect(command.id).toBe('query')

    const args = command.args as QueryCommand['args']
    expect(args.status).toContain('to-do')
    expect(args.deadline).toEqual({ '$lte': now.endOf('month').toLocaleString(DateTime.DATE_FULL) })
  });

  it(`should answer update command on "I'm finished with taxes"`, async () => {
    const text = "I'm finished with taxes"

    const {original, commands, response} = await agent.plan({text: text})

    expect([
      {'system': agent.systemMessage},
      {'user': text},
      {'assistant': original.text}
    ]).toMatchSnapshot();

    expect(commands).toHaveLength(1)
    expect(response).toBeDefined()

    const [command] = commands!
    expect(command.id).toBe('update')

    const args = command.args as UpdateCommandArgs
    expect(args.filter).toBeDefined()
    expect(args.filter.entities).toBe('taxes')
    expect(args.filter.status).toBe('to-do')
    expect(args.update).toBeDefined()
    expect(args.update.$set.status).toBe('done')
  });
    
});