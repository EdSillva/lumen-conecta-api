import type { FastifyReply, FastifyRequest } from "fastify";
import { getFirebaseApp } from "../../shared/firebase";
import {
  findUserByFirebaseUid,
  createUser,
  updateUserProfile,
} from "../../db/users";
import { Role } from "../../schemas/user";

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    return reply.status(401).send({ message: "Missing Authorization header" });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const app = getFirebaseApp();
    const decoded = await app.auth().verifyIdToken(token);

    const body = request.body as { name?: string; email?: string } | undefined;
    const nameFromBody = body?.name?.trim();
    const emailFromBody = body?.email?.trim();
    const name = (nameFromBody || decoded.name || "") as string;
    const email = emailFromBody || decoded.email || "";

    let user = await findUserByFirebaseUid(decoded.uid);

    if (!user) {
      user = await createUser({
        firebase_uid: decoded.uid,
        name,
        email,
        roles: [Role.PUBLIC],
      });
    } else {
      const needsName = !!(nameFromBody && nameFromBody !== user.name);
      const needsEmail = !!(emailFromBody && emailFromBody !== user.email);

      if (needsName || needsEmail) {
        user = await updateUserProfile(user.id, {
          name: needsName ? nameFromBody : undefined,
          email: needsEmail ? emailFromBody : undefined,
        });
      }
    }

    request.user = {
      id: user.id,
      firebaseUid: decoded.uid,
      roles: user.roles,
    };
  } catch (err) {
    request.log.error(err);
    return reply.status(401).send({ message: "Invalid token" });
  }
}
