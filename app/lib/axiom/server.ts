import axiomClient from '@/app/lib/axiom/axiom';
import { Logger, AxiomJSTransport } from '@axiomhq/logging';
import { nextJsFormatters } from '@axiomhq/nextjs';

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
    transports: [
        new AxiomJSTransport({
            axiom: axiomClient,
            dataset: process.env.AXIOM_DATASET!,
        }),
    ],
    formatters: [...nextJsFormatters, sanitizeFieldsFormatter],
});
