import type { FastifyInstance } from 'fastify';
import { eventsRoutes } from './modules/events/events.routes';
import { galleriesRoutes } from './modules/galleries/galleries.routes';
import { backofficeRoutes } from './modules/backoffice/backoffice.routes';
import { authRoutes } from './modules/auth/auth.routes';

export async function registerRoutes(app: FastifyInstance) {
  await app.register(authRoutes);
  await app.register(eventsRoutes);
  await app.register(galleriesRoutes);
  await app.register(backofficeRoutes);
}
