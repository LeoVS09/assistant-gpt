import { generateTasks } from "./generate-commands";
import { generateSystemPrompt } from "./prompt";


describe('generateTasks', () => {

  const now = 'Tue Apr 04 2023'
  console.log('assume for tests current date is', now)

  const system = generateSystemPrompt(now)

  const prompts = [
    'Need work on taxes this week',
    'What to read this month?',
  ]

  for (const prompt of prompts) {

    it(`should correctly answer on '${prompt}'`, async () => {
      const res = await generateTasks(system, prompt)
      
      console.log(`- User: ${prompt}\n-Tasks: ${res.text}\n`)

      expect([
        {'system': system},
        {'user': prompt},
        {'assistant': res.text}
      ]).toMatchSnapshot();
    });
    
  }
    
});
