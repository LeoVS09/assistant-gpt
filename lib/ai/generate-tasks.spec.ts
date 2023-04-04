import {generateTasks, SystemPrompt} from './index.ts'

describe('generateTasks', () => {

  const prompts = [
    'Need work on taxes this week',
    'What to read this month?',
  ]

  for (const prompt of prompts) {

    it(`should correctly answer on ${prompt}`, async () => {
      const res = await generateTasks(SystemPrompt, prompt)
      
      console.log(`- User: ${prompt}\n-Tasks: ${res.text}\n`)

      expect([
        {'system': SystemPrompt},
        {'user': prompt},
        {'assistant': res.text}
      ]).toMatchSnapshot();
    });
    
  }
    
});
