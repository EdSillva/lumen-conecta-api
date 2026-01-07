import "fastify";
import { Role } from "../schemas/user";

declare module "fastify" {
  interface FastifyRequest {
    user: {
      id: string;
      firebaseUid: string;
      roles: Role[];
    };
  }
}
