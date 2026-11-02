import { config } from 'dotenv';
import { defineConfig, env } from 'prisma/config';

// Load the Neon environment variables from the project root.
config({ path: '../.env.local' });

export default defineConfig({
  schema: 'prisma/schema.prisma',

  migrations: {
    path: 'prisma/migrations',
  },

  datasource: {
    url: env('DATABASE_URL_UNPOOLED'),
  },
});
