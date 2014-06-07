declare module "temp" {
    export function mkdir(prefix: string, callback: (err: any, dirPath: string) => void): void;
    export function track(): void;
}
