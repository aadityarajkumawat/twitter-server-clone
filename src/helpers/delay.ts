export function delay(t: number, data: any) {
    return new Promise((resolve, _) => {
        setTimeout(() => {
            resolve(data);
        }, t);
    });
}
