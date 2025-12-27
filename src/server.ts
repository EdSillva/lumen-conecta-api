import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';

import { registerRoutes } from './routes';
import { supabase } from './shared/supabase';

dotenv.config();

async function bootstrap() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });
  await registerRoutes(app);

  if (!supabase) {
    app.log.warn('Supabase client not configured; set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  }

  const port = Number(process.env.PORT ?? 3333);
  const host = process.env.HOST ?? '0.0.0.0';

  try {
    await app.listen({ port, host });
    app.log.info('Lumen API is up and running!');
    app.log.info(`API running at http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

void bootstrap();
