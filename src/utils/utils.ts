export const delay = (ms: number): Promise<any> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export const cloneObject = <T>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj));
}
