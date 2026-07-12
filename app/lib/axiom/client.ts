'use client';

import { Logger, ProxyTransport } from '@axiomhq/logging';
import { createUseLogger } from '@axiomhq/react';

const sanitizeFieldsFormatter = (logEvent: any) => {
    if (logEvent.fields) {
        const sanitizedFields = { ...logEvent.fields };
        for (const [key, value] of Object.entries(sanitizedFields)) {
            if (value && typeof value === 'object') {
                sanitizedFields[key] = JSON.stringify(value);
            }
        }
        return {
            ...logEvent,
            fields: sanitizedFields,
        };
    }
    return logEvent;
};

export const logger = new Logger({
    transports: [new ProxyTransport({ url: '/api/axiom', autoFlush: true })],
    formatters: [sanitizeFieldsFormatter],
});

const useLogger = createUseLogger(logger);

export { useLogger };
