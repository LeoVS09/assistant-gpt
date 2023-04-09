
/**
 * Checks the argument for compliance with valid json
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch#The_exception_identifier
 * @param {*} text
 * @returns {boolean}
 */
export function validateJson(text: string) {
    try {
        JSON.parse(text);
    } catch (error) {
        throw error;
    }
}

/**
 * Checks the argument for compliance with valid JSONObject
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON#Full_JSON_syntax
 * @param {*} text
 * @returns {boolean}
 */
export function validateJsonObject(text: string) {
    if (typeof text !== 'string') {
        throw new Error('Text is not a string')
    }

    const startsWithOpeningCurlyBrace = text.indexOf('{') === 0;
    const endsWithClosingCurlyBrace = text.lastIndexOf('}') === (text.length - 1);

    if (startsWithOpeningCurlyBrace && endsWithClosingCurlyBrace) {
        return validateJson(text);
    }

    throw new Error('Text is not a valid json object, it must start with { and end with }');
}