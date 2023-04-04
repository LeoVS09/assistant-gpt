/**
 * Checks the argument for compliance with valid json
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch#The_exception_identifier
 * @param {*} text
 * @returns {boolean}
 */
export function isValidJson(text: string) {
    try {
        JSON.parse(text);
        return true;
    } catch (error) {
        console.error('Error during validation on json', error);
        return false;
    }
}

/**
 * Checks the argument for compliance with valid JSONObject
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON#Full_JSON_syntax
 * @param {*} text
 * @returns {boolean}
 */
export function isValidJsonObject(text: string) {
    if (typeof text !== 'string') {
        return false;
    }

    const startsWithOpeningCurlyBrace = text.indexOf('{') === 0;
    const endsWithClosingCurlyBrace = text.lastIndexOf('}') === (text.length - 1);

    if (startsWithOpeningCurlyBrace && endsWithClosingCurlyBrace) {
        return isValidJson(text);
    }

    return false;
}