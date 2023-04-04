# Example output on prompt

```
- User: Need work on taxes this week
-Tasks: {
  "tasks": [
    {
      "task": "save",
      "args": {
        "text": "Need work on taxes this week",
        "entities": ["taxes"],
        "tags": ["work list", "high priority"],
        "status": "to-do",
        "end-date": "10 April 2023"
      }
    }
  ],
  "response": "Taxes added to work list"
}

- User: What to read this month?
-Tasks: { "tasks": [{ "task": "query", "args": { tags: 'reading list', status: ‘to-do’, “end-date”: {$lte: “30 April 2023”} } }], "response": "Books to read this month" }
```
