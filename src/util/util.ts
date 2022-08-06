export const firstCharToLower = (str: string) => {
    return str.charAt(0).toLowerCase() + str.slice(1)
}

export const firstCharToUpper = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1)
}
