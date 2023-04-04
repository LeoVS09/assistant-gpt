export async function retry<Response>(func: (res?: Response, error?: any) => Promise<Response>, validate: (arg: Response) => void, retryCount = 3) {
    let res = await func()
    const checkIsValid = genIsValid(validate)


    let finalError

    let retry = 0
    while (retry < retryCount) {
        const {isValid, error} = checkIsValid(res)
        if (isValid) 
            return res
        
        finalError = error

        res = await func(res, error)
        retry++
    }



    throw finalError
}

export const genIsValid = <Response>(validate: (arg: Response) => void) => (response: Response) => {
    try {
        validate(response)
        
        return {isValid: true}
    } catch (error) {
        console.error('Error during execution', error, 'for response', response)
        return {isValid: false, error}
    }
}
