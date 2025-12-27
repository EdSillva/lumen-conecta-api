import type { FastifyReply, FastifyRequest } from 'fastify';
import { Role } from '../../types';

export function requireRole(required: Role | Role[]) {
  const list = Array.isArray(required) ? required : [required];

  return async (request: FastifyRequest, reply: FastifyReply) => {
    const userRoles = request.user?.roles ?? [];
    const allowed = list.some((role) => userRoles.includes(role));

    if (!allowed) {
      return reply.status(403).send({ message: 'Forbidden' });
    }
  };
}
