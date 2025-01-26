import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(5, '20 s'),
    analytics: true,
    prefix: '@upstash/ratelimit',
});

export default ratelimit;
