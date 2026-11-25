import { Kafka, Producer, LogEntry } from 'kafkajs';
import { logger } from '@/app/lib/axiom/server';

declare global {
    var kafkaProducer: Producer | undefined;
    var kafkaStatus: { isConnected: boolean } | undefined;
}

export const kafkaStatus = global.kafkaStatus || { isConnected: false };

let producer: Producer | null = null;

if (process.env.KAFKA_BROKER) {
    if (
        process.env.NODE_ENV === 'production' &&
        process.env.SKIP_ENV_VALIDATION !== 'true' &&
        (!process.env.KAFKA_SSL_KEY ||
            !process.env.KAFKA_SSL_CERT ||
            !process.env.KAFKA_SSL_CA)
    ) {
        throw new Error(
            'KAFKA_SSL_KEY, KAFKA_SSL_CERT, and KAFKA_SSL_CA are required in production when KAFKA_BROKER is set'
        );
    }

    const kafka = new Kafka({
        clientId: 'jorbites-app',
        brokers: [process.env.KAFKA_BROKER],
        ssl: {
            rejectUnauthorized: true,
            key: process.env.KAFKA_SSL_KEY || '',
            cert: process.env.KAFKA_SSL_CERT || '',
            ca: process.env.KAFKA_SSL_CA || '',
        },
        logCreator:
            () =>
            ({ level, log }: LogEntry) => {
                if (process.env.NODE_ENV === 'development' && level < 4) return;
                logger.info(log.message);
            },
    });

    producer = global.kafkaProducer || kafka.producer();

    if (process.env.NODE_ENV !== 'production') {
        global.kafkaProducer = producer;
        global.kafkaStatus = kafkaStatus;
    }
}

export default producer;

const KAFKA_TIMEOUT_MS = 3000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    let timeoutHandle: ReturnType<typeof setTimeout>;

    const timeoutPromise = new Promise<T>((_, reject) => {
        timeoutHandle = setTimeout(() => {
            reject(new Error(`Kafka operation timed out after ${ms}ms`));
        }, ms);
    });

    return Promise.race([promise, timeoutPromise]).finally(() => {
        clearTimeout(timeoutHandle);
    });
}

export interface KafkaBatchMessage {
    key?: string;
    value: string;
}

export async function produceKafkaBatch(
    topic: string,
    messages: KafkaBatchMessage[]
): Promise<boolean> {
    if (messages.length === 0) {
        return true;
    }

    if (!producer) {
        if (process.env.NODE_ENV !== 'production') {
            logger.info(
                `[Kafka Disabled] Mock batch send to ${topic} (${messages.length} events)`
            );
        } else {
            logger.warn(
                `[Kafka Disabled] Dropping ${messages.length} events for topic ${topic}`
            );
        }
        return false;
    }

    try {
        if (!kafkaStatus.isConnected) {
            await withTimeout(producer.connect(), KAFKA_TIMEOUT_MS);
            kafkaStatus.isConnected = true;
        }

        await withTimeout(
            producer.send({
                topic,
                messages,
            }),
            KAFKA_TIMEOUT_MS
        );
        return true;
    } catch (error) {
        kafkaStatus.isConnected = false;
        logger.error('Failed to produce Kafka batch', {
            topic,
            count: messages.length,
            error: error instanceof Error ? error.message : String(error),
        });
        return false;
    }
}
