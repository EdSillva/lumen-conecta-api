import type { FastifyReply, FastifyRequest } from "fastify";
import { Role } from "../../schemas/user";

export function requireRole(required: Role | Role[]) {
  const list = Array.isArray(required) ? required : [required];

  return async (request: FastifyRequest, reply: FastifyReply) => {
    const user = request.user;
    const userRoles = user?.roles ?? [];
    const allowed = list.some((role) => userRoles.includes(role));

    if (!allowed) {
      return reply.status(403).send({ message: "Forbidden" });
    }
  };
}
