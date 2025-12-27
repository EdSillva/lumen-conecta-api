import 'fastify';
import type { RequestUser } from './types';

declare module 'fastify' {
  interface FastifyRequest {
    user?: RequestUser;
  }
}
