export function log(...messages: any[]): void {
    console.log(new Date, ...messages);
}

export function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function rand(): string {
    return Math.random().toString(36);
}

export function memory(): number {
    return Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100;
}
