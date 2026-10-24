import { AsyncLocalStorage } from 'node:async_hooks';

if (typeof globalThis.AsyncLocalStorage === 'undefined') {
    (globalThis as any).AsyncLocalStorage = AsyncLocalStorage;
}
