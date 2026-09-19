declare module 'expo' {
    export class NativeModule<T = {}> {
        addListener(eventName: string, listener: (event: any) => void): { remove: () => void };
    }
    export function requireNativeModule<T>(name: string): T;
}
