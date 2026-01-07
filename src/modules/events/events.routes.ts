import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { authMiddleware } from "../auth/auth.middleware";
import { requireRole } from "../auth/roles.middleware";
import { Role } from "../../schemas/user";
import {
  createEventSchema,
  updateEventSchema,
  EventStatus,
  type EventResponse,
} from "../../schemas/events";
import { getSupabase } from "../../shared/supabase";

if (!getSupabase) {
  // Early diagnostic to surface missing env vars
  console.error(
    "[supabase] client not configured. Check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
  );
}

const eventIdParamSchema = z.object({ id: z.string() });

export function eventsRoutes(app: FastifyInstance) {
  const supabase = getSupabase();

  app.get("/events", async () => {
    if (!supabase) {
      throw new Error("Supabase client not configured");
    }

    const { data, error } = await supabase
      .from("events")
      .select(
        "id, title, description, date, location, status, created_by, created_at, updated_at, cover_image",
      )
      .eq("status", EventStatus.APPROVED)
      .order("created_at", { ascending: false });

    if (error) {
      // Log query errors for diagnostics
      console.error("[events] list approved error", error);
      throw error;
    }

    return (data ?? []).map(toEventResponse);
  });

  app.get("/events/:id", async (request, reply) => {
    const params = eventIdParamSchema.parse(request.params);

    if (!supabase) {
      throw new Error("Supabase client not configured");
    }

    const { data, error } = await supabase
      .from("events")
      .select(
        "id, title, description, date, location, status, created_by, created_at, updated_at, cover_image",
      )
      .eq("id", params.id)
      .single();

    if (error) {
      console.error("[events] get error", { id: params.id, error });
      return reply.status(404).send({ message: "Event not found" });
    }

    return reply.send(toEventResponse(data));
  });

  app.post(
    "/events",
    { preHandler: [authMiddleware, requireRole([Role.CREATOR, Role.ADMIN])] },
    async (request, reply) => {
      const user = request.user;
      let payload;
      try {
        payload = createEventSchema.parse(request.body);
      } catch (err) {
        request.log.error({ err }, "[events] validation failed");
        return reply.status(400).send({ message: "Invalid payload" });
      }

      if (!supabase) {
        request.log.error("[supabase] client not configured");
        return reply.status(500).send({ message: "Supabase not configured" });
      }

      console.info("[events] creating", {
        payload,
        supabaseReady: Boolean(supabase),
      });

      try {
        const { data, error } = await supabase
          .from("events")
          .insert({
            title: payload.title,
            description: payload.description,
            date: payload.date,
            location: payload.location,
            status: EventStatus.PENDING,
            created_by: user.id,
            updated_at: null,
          })
          .select(
            "id, title, description, date, location, status, created_by, created_at, updated_at, cover_image",
          )
          .single();

        if (error || !data) {
          request.log.error({ error }, "[events] failed to create");
          console.error("[events] failed to create", error);
          return reply
            .status(500)
            .send({ message: "Unable to create event", error: error?.message });
        }

        return reply.code(201).send(toEventResponse(data));
      } catch (err) {
        request.log.error({ err }, "[events] exception creating");
        console.error("[events] exception creating", err);
        return reply.status(500).send({
          message: "Unable to create event",
          error: (err as Error).message,
        });
      }
    },
  );

  app.put(
    "/events/:id",
    { preHandler: [authMiddleware, requireRole([Role.CREATOR, Role.ADMIN])] },
    async (request, reply) => {
      const params = eventIdParamSchema.parse(request.params);
      const payload = updateEventSchema.parse(request.body);

      if (!supabase) {
        throw new Error("Supabase client not configured");
      }

      request.log.info({ id: params.id, payload }, "[events] updating");

      const { data, error } = await supabase
        .from("events")
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", params.id)
        .select(
          "id, title, description, date, location, status, created_by, created_at, updated_at, cover_image",
        )
        .single();

      if (error || !data) {
        request.log.error({ error }, "[events] failed to update");
        return reply.status(500).send({ message: "Unable to update event" });
      }

      return reply.send(toEventResponse(data));
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
