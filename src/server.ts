import Fastify from "fastify";
import cors from "@fastify/cors";
import dotenv from "dotenv";

import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";

import { registerRoutes } from "./routes";
import { getSupabase } from "./shared/supabase";

dotenv.config();

async function bootstrap() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });

  // 🔹 Swagger (OpenAPI)
  await app.register(swagger, {
    openapi: {
      info: {
        title: "Lumen API",
        description: "Documentação da API do Lumen Conecta",
        version: "1.0.0",
      },
    },
  });

  await app.register(swaggerUI, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
  });

  await registerRoutes(app);

  if (!getSupabase) {
    app.log.warn(
      "Supabase client not configured; set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  const port = Number(process.env.PORT ?? 3333);
  const host = process.env.HOST ?? "0.0.0.0";

  try {
    await app.listen({ port, host });
    app.log.info("Lumen API is up and running!");
    app.log.info(`Docs available at http://${host}:${port}/docs`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

void bootstrap();
