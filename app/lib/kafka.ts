import { Kafka, Producer, LogEntry } from 'kafkajs';
import { logger } from '@/app/lib/axiom/server';

declare global {
    var kafkaProducer: Producer | undefined;
}

const kafka = new Kafka({
    clientId: 'jorbites-app',
    brokers: [process.env.KAFKA_BROKER || ''],
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

const producer = global.kafkaProducer || kafka.producer();

if (process.env.NODE_ENV !== 'production') {
    global.kafkaProducer = producer;
}

export default producer;
