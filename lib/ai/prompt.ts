import {DateTime} from 'luxon';

export interface Output {
    response: string;
    /** Can be empty */
    commands?: Array<AbstractCommand>;
}

export interface AbstractCommand<Args = object> {
    id: string;
    args: Args;
}

const responseFormat: Output = { commands: [{ id: "command-id", args: {} }], response: "Optional response to the user" }

const commandsList: Array<{ command: string, description: string }> = [
    { command: "save", "description": "Save the args as document in MongoDB" },
    { command: "query", "description": "Execute MongoDB find query with given arguments in args" },
    { command: "update", "description": "Update existing document in MongoDB using updateOne operation" }
]

const exampleCases = (date: DateTime): Array<{ prompt: string, result: Output }> => [
    {
        prompt: "Need buy milk today",
        result: {
            commands: [
                {
                    id: "save",
                    args: {
                        "text": "Need buy milk today", "entities": ["milk", "today"], "tags": ["shopping list", "minor priority"], status: "to-do", 
                        "deadline": date.toLocaleString(DateTime.DATE_FULL)
                    }
                }
            ],
            response: "Milk added to shoping list"
        },
    },
    {
        prompt: "Read book about strategies in business",
        result: {
            commands: [
                {
                    id: "save",
                    args: { 
                        "text": "Read book about strategies in business this week", "entities": ["strategies in business"], "tags": ["reading list", "book", "low priority"], status: "to-do", 
                    }
                }
            ],
            response: "strategies in business added to reading list"
        }
    },
    {
        prompt: "Show shopping list",
        result: {
            commands: [
                { id: "query", args: { tags: 'shopping list', status: "to-do" } }
            ],
            response: "Current shopping list"
        },
    },
    {
        prompt: "What I need work on this week?",
        result: {
            commands: [
                { id: "query", args: { status: "to-do", "deadline": { $lte: date.endOf('week').toLocaleString(DateTime.DATE_FULL) } } }
            ],
            response: "Items in progress for this week"
        }
    },
    {
        prompt: "I bought milk and apple",
        result: {
            commands: [
                { id: "update", args: { filter: { tags: 'shopping list', status: "to-do", entities: "milk" }, "update": { "$set": { "status": "done" } } } }, 
                { id: "update", args: { filter: { tags: 'shopping list', status: "to-do", entities: "apple" }, "update": { "$set": { "status": "done" } } } }
            ],
            response: "Milk and apple marked as completed in shoping list"
        },
    },
    {
        prompt: "I read book about strategies in business",
        result: {
            commands: [
                { id: "update", args: { filter: { tags: 'reading list', status: "to-do", entities: "strategies in business" }, "update": { "$set": { "status": "done" } } } }
            ],
            response: "strategies in business marked as completed in reading list"
        },
    },
    {
        prompt: "Why sky is blue?",
        result: {
            commands: [],
            response: `
The sky appears blue due to a phenomenon called Rayleigh scattering. This occurs when sunlight interacts with molecules and tiny particles in Earth's atmosphere. The short wavelengths of light, such as blue and violet, are scattered more efficiently by these particles than the longer wavelengths, such as red and yellow.

Although both blue and violet light are scattered more, our eyes are more sensitive to blue light. Moreover, the shorter-wavelength violet light is absorbed by the ozone layer high up in the atmosphere. As a result, when we look at the sky, we perceive it as blue.

It's important to note that the sky's color can change under different conditions. For example, during sunrise and sunset, the sky may appear red or orange due to the longer path sunlight travels through the atmosphere. This causes increased scattering of shorter wavelengths, allowing the longer wavelengths to dominate our perception.
`}
    }
]

function getExampleCases(date: DateTime) {
    let result = ''

    for (const example of exampleCases(date)) {
        result += `
    - User prompt: "${example.prompt}".
    - Assistent output: ${JSON.stringify(example.result)}
    `
    }

    return result
}


export const generateSystemPrompt = (date: DateTime) => `
You are personal AI assistant, which primarily working as note and task manger. You can save or update data and execute queries to MongoDB.
You can use any of the following commands: ${JSON.stringify(commandsList, null, 2)}.
You must parse user prompt and output list of commands together with your response to user. Whole output must be written in JSON. 
Output format: ${JSON.stringify(responseFormat, null, 2)}
A special task-id refers to id of task from previus list.

In case of user asking general question, you must output answer to user in "response" field, with empty commands list.

Assume the current date is ${date.toLocaleString(DateTime.DATE_FULL)}.

Here are several example cases for your reference: (${getExampleCases(date)})


Ouput must be allways in valid JSON notation.
`


export const errorExample = (date: DateTime): Output => ({
    commands: [{
        id: "save", args: { 
            "text": "Need buy milk today", "entities": ["milk", "today"], "tags": ["shopping list", "minor priority"], status: "to-do", 
            deadline: date.toLocaleString(DateTime.DATE_FULL) 
        }
    }],
    response: "Milk added to shoping list"
})

// GPT-3.5 allways output appologies for mistakes, need use  to split it from real response
export const generatePromptToFixJsonError = (separator: string, date: DateTime, error?: any) => `
Previusly you outputed invalid JSON. Please fix it. 
Here is the error message: ${errorToString(error)}

Output response in valid JSON notation. Write final result after words ${separator}.

There example:
I apologize for the mistake. Here is the corrected JSON response:
${separator} ${JSON.stringify(errorExample(date), null, 2)}
`

const errorToString = (error?: any) => {
    if (error) {
        return error.toString() || error.message || JSON.stringify(error)
    }

    return 'Unknown error'
}