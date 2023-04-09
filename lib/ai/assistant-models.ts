/** Output of assistant based on user input */
export interface AssistantOutput {
    /** Response from assitant to the user */
    response: string;
    /** 
     * List of the commands to execute, must be based on user input. 
     * Can be empty 
     * */
    commands?: Array<AbstractCommand>;
}

/** Base abstract interface for commands */
export interface AbstractCommand<Args = object> {
    /** Id of the command to execute */
    id: string;
    /** Arguments which need pass to command execution logic */
    args: Args;
}

/** Comand which ask save command arguments to database */
export interface SaveCommand extends AbstractCommand<SaveCommandArgs> {
    id: "save";

    /** Arguments for save command, will be saved to database as it is */
    args: SaveCommandArgs;
}

/** 
 * Arguments for save command, will be saved to database as it is.
 * Additional data and fields can be added to this interface by assistant if need for user case
 * */
export interface SaveCommandArgs {
    /** Text of the note or task */
    text: string;

    /** 
     * List of the entities which present in text, usefull to query by entity 
     * For example: "Buy milk today" -> ["milk", "today"]
     * */
    entities?: Array<string>;

    /** 
     * List of the tags which can be build based on text, usefull to group multiple notes together 
     * For example: "Buy milk today" -> ["shopping list", "minor priority"]
     * Base tags to group in different lists can be: "shopping list", "reading list", "work list", "personal list"
     * Base tags to group by priority can be: "criticial priority", "high priority", "medium priority", "low priority"
     * Can be extended or adjusted by user
     * Additional tags, specific for user can be added as well
     * */
    tags?: Array<string>;

    /**
     * Status of the note or task, can be "to-do", "in-progress", "done"
     * Can be extended or adjusted by user
     * */
    status?: "string";

    /**
     * Deadline of the note or task. Represented as string in date format
     * */
    deadline?: string;
}


/** Comand which ask execute find query in database with given arguments */
export interface QueryCommand extends AbstractCommand<any> {
    id: "query";

    /** Arguments for query command, will be used to execute find query in database */
    args: any;
}

/** Comand which ask execute update command in database with given arguments */
export interface UpdateCommand extends AbstractCommand<UpdateCommandArgs> {
    id: "update";

    /** 
     * Arguments for update command, will be used to execute update query in database 
     * For example: What I need work on this week? -> {"status":"to-do","deadline":{"$lte":"April 9, 2023"}}
     * */
    args: UpdateCommandArgs;
}

/** Arguments for update command, will be used to execute update query in database */
export interface UpdateCommandArgs {
    /**
     * Query to find document to update
     * For example: I read book about strategies in business this week -> { tags: 'reading list', status: "to-do" }
     * */
    filter: any;

    /**
     * Update query to update document
     * For example: I read book about strategies in business this week -> { "$set": { "status": "done" } }
     * */
    update: any;
}