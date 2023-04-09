export async function retry<Response>(
    call: (res?: Response) => Promise<Response>,
    onError: (error?: any) => Promise<Response>, 
    retryCount = 3
) {
    try {
        return await call()
    } catch (error) {
        let finalError = error

        let retry = 0
        while (retry < retryCount) {
            try {
                return await onError(finalError)
            } catch (retryError) {
                finalError = retryError
            }
            
            retry++
        }

        throw finalError
    }
}

export const genIsValid = <Response>(validate: (arg: Response) => void) => (response: Response) => {
    try {
        validate(response)
        
        return {isValid: true}
    } catch (error) {
        console.warn('Error during execution', error, 'for response', response)
        return {isValid: false, error}
    }
}
