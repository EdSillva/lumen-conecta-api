import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { authMiddleware } from "./auth.middleware";
import { Role } from "../../types";
import { setUserRoles } from "../../db/users";

const assignableRoles = [Role.PUBLIC, Role.CREATOR] as const;

const roleSchema = z.object({
  role: z.enum(assignableRoles),
});

export function authRoutes(app: FastifyInstance) {
  app.get("/auth/me", { preHandler: [authMiddleware] }, (request) => {
    return {
      id: request.user!.id,
      firebaseUid: request.user!.firebaseUid,
      roles: request.user!.roles,
    };
  });

  app.post(
    "/auth/role",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const { role } = roleSchema.parse(request.body);
      const currentRoles = request.user?.roles ?? [];
      const mergedRoles = Array.from(new Set<Role>([...currentRoles, role]));

      const roles = await setUserRoles(request.user!.id, mergedRoles);
      return reply.send({ roles });
    }
  );

  app.post(
    "/auth/register",
    { preHandler: [authMiddleware] },
    async (request, reply) => {
      const schema = z.object({
        roles: z.array(z.nativeEnum(Role)).nonempty().max(2),
      });

      const { roles } = schema.parse(request.body);

      const allowed = [Role.PUBLIC, Role.CREATOR];
      const safeRoles = roles.filter((r) => allowed.includes(r));
      const finalRoles = safeRoles.length ? safeRoles : [Role.PUBLIC];

      await setUserRoles(request.user!.id, finalRoles);

      return reply.send({ roles: finalRoles });
    }
  );
}
