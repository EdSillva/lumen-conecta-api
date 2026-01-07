import type { FastifyInstance } from "fastify";
import { z } from "zod";

import { authMiddleware } from "./auth.middleware";
import { setUserRoles } from "../../db/users";
import { Role } from "../../schemas/user";

const assignableRoles = JSON.parse(
  process.env.ASSIGNABLE_ROLES || "[]",
) as Role[];

const roleSchema = z.object({
  role: z.enum([Role.PUBLIC, Role.CREATOR, Role.USER, Role.ADMIN]),
});

export function authRoutes(app: FastifyInstance) {
  app.get("/auth/me", { preHandler: [authMiddleware] }, (request) => {
    const user = request.user;
    return {
      id: user.id,
      firebaseUid: user.firebaseUid || null,
      roles: user.roles || [],
    };
  });

  app.post<{
    Body: { role: Role };
  }>("/auth/role", { preHandler: [authMiddleware] }, async (request, reply) => {
    const { role } = roleSchema.parse(request.body);

    if (!assignableRoles.includes(role)) {
      return reply.status(403).send({ message: "Role not allowed" });
    }

    const user = request.user;
    const currentRoles = user.roles;
    const mergedRoles = Array.from(new Set<Role>([...currentRoles, role]));

    const roles = await setUserRoles(user.id, mergedRoles);
    return reply.send({ roles });
  });

  app.post<{
    Body: { roles: Role[] };
  }>(
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

      const user = request.user;
      await setUserRoles(user.id, finalRoles);

      return reply.send({ roles: finalRoles });
    },
  );
}
