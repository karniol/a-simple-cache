export function log(...messages: any[]): void {
    console.log(new Date, ...messages);
}

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function rand(): string {
    return Math.random().toString(36);
}

export function heapUsed(): number {
    return process.memoryUsage().heapUsed / 1024 / 1024;
}

export function heapTotal(): number {
    return process.memoryUsage().heapTotal / 1024 / 1024;
}
