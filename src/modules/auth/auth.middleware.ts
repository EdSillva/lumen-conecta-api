import type { FastifyReply, FastifyRequest } from "fastify";
import { getFirebaseApp } from "../../shared/firebase";
import { findUserByFirebaseUid, createUser } from "../../db/users";
import { Role } from "../../types";

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return reply.status(401).send({ message: "Missing Authorization header" });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const app = getFirebaseApp();
    const decoded = await app.auth().verifyIdToken(token);

    let user = await findUserByFirebaseUid(decoded.uid);

    if (!user) {
      user = await createUser({
        firebase_uid: decoded.uid,
        email: decoded.email,
        roles: [Role.PUBLIC],
      });
    }

    request.user = {
      id: user.id,
      firebaseUid: decoded.uid,
      roles: user.roles as Role[],
    };
  } catch (err) {
    request.log.error(err);
    return reply.status(401).send({ message: "Invalid token" });
  }
}
