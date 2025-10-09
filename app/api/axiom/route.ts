import { logger } from '@/app/lib/axiom/server';
import { createProxyRouteHandler } from '@axiomhq/nextjs';

export const POST = createProxyRouteHandler(logger);
