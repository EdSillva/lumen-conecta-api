import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { authMiddleware } from "../auth/auth.middleware";
import { requireRole } from "../auth/roles.middleware";
import { Role } from "../../schemas/user";
import {
  EventStatus,
  type EventResponse,
  galleryResponseSchema,
} from "../../schemas/index";
import { getSupabase } from "../../shared/supabase";

const galleryParams = z.object({ id: z.string() });
const eventParams = z.object({ id: z.string() });

export function backofficeRoutes(app: FastifyInstance) {
  const supabase = getSupabase();

  app.get(
    "/backoffice/events/pending",
    { preHandler: [authMiddleware, requireRole(Role.ADMIN)] },
    async () => {
      if (!supabase) {
        throw new Error("Supabase client not configured");
      }

      const { data, error } = await supabase
        .from("events")
        .select(
          "id, title, description, date, location, status, created_by, created_at, updated_at, cover_image",
        )
        .eq("status", EventStatus.PENDING)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return (data ?? []).map(toEventResponse);
    },
  );

  app.put(
    "/backoffice/events/:id/approve",
    { preHandler: [authMiddleware, requireRole(Role.ADMIN)] },
    async (request, reply) => {
      const params = eventParams.parse(request.params);
      if (!supabase) {
        throw new Error("Supabase client not configured");
      }

      const { data, error } = await supabase
        .from("events")
        .update({
          status: EventStatus.APPROVED,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id)
        .select(
          "id, title, description, date, location, status, created_by, created_at, updated_at, cover_image",
        )
        .single();

      if (error || !data) {
        return reply.status(404).send({ message: "Event not found" });
      }

      return reply.send(toEventResponse(data));
    },
  );

  app.put(
    "/backoffice/events/:id/reject",
    { preHandler: [authMiddleware, requireRole(Role.ADMIN)] },
    async (request, reply) => {
      const params = eventParams.parse(request.params);
      if (!supabase) {
        throw new Error("Supabase client not configured");
      }

      const { data, error } = await supabase
        .from("events")
        .update({
          status: EventStatus.REJECTED,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id)
        .select(
          "id, title, description, date, location, status, created_by, created_at, updated_at, cover_image",
        )
        .single();

      if (error || !data) {
        return reply.status(404).send({ message: "Event not found" });
      }

      return reply.send(toEventResponse(data));
    },
  );

  app.delete(
    "/backoffice/events/:id",
    { preHandler: [authMiddleware, requireRole(Role.ADMIN)] },
    async (request, reply) => {
      const params = eventParams.parse(request.params);
      if (!supabase) {
        throw new Error("Supabase client not configured");
      }

      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", params.id);

      if (error) {
        return reply.status(404).send({ message: "Event not found" });
      }

      return reply.code(204).send({ id: params.id });
    },
  );

  app.put(
    "/backoffice/galleries/:id",
    { preHandler: [authMiddleware, requireRole(Role.ADMIN)] },
    async (request, reply) => {
      const params = galleryParams.parse(request.params);
      const payload = galleryResponseSchema
        .partial({ id: true, createdBy: true, createdAt: true })
        .parse(request.body);
      return reply.send({ id: params.id, ...payload });
    },
  );

  app.delete(
    "/backoffice/galleries/:id",
    { preHandler: [authMiddleware, requireRole(Role.ADMIN)] },
    async (request, reply) => {
      const params = galleryParams.parse(request.params);
      return reply.code(204).send({ id: params.id });
    },
  );
}

type EventRow = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  status: EventStatus;
  cover_image: string | null;
  created_by: string;
  created_at: string;
  updated_at: string | null;
};

function toEventResponse(row: EventRow): EventResponse {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    date: row.date,
    location: row.location,
    status: row.status,
    coverImage: row.cover_image ?? undefined,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at ?? undefined,
  };
}
