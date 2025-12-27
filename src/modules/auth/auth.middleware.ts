import type { FastifyReply, FastifyRequest } from 'fastify';
import { getFirebaseApp } from '../../shared/firebase';
import { Role, type RequestUser } from '../../types';

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;
  request.log.info({ authHeader }, 'Checking authorization');
  if (!authHeader) {
    return reply.status(401).send({ message: 'Missing Authorization header' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const app = getFirebaseApp();
    const decoded = await app.auth().verifyIdToken(token);

    // TODO: fetch roles from database; for now rely on custom claims
    const roles = (decoded.roles as Role[] | undefined) ?? [Role.CREATOR];

    request.user = {
      id: decoded.uid,
      firebaseUid: decoded.uid,
      roles
    } satisfies RequestUser;
  } catch (err) {
    request.log.error({ err }, 'Auth verification failed');
    return reply.status(401).send({ message: 'Invalid token' });
  }
}
