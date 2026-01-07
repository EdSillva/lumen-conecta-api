import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { authMiddleware } from "../auth/auth.middleware";
import { requireRole } from "../auth/roles.middleware";
import { Role } from "../../schemas/user";
import {
  createGallerySchema,
  type GalleryResponse,
} from "../../schemas/galleries";

const paramsSchema = z.object({ id: z.string() });

export function galleriesRoutes(app: FastifyInstance) {
  app.post(
    "/events/:id/gallery",
    { preHandler: [authMiddleware, requireRole(Role.CREATOR)] },
    async (request, reply) => {
      const params = paramsSchema.parse(request.params);
      const body =
        typeof request.body === "object" && request.body !== null
          ? request.body
          : {};
      const payload = createGallerySchema.parse({
        ...(body as Record<string, unknown>),
        eventId: params.id,
      });

      const user = request.user;

      const gallery: GalleryResponse = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        createdBy: user.id,
        title: payload.title,
        eventId: payload.eventId,
      };

      return reply.code(201).send(gallery);
    },
  );
}
