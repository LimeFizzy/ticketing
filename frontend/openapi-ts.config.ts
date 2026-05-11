import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: './swagger.json',
  output: 'src/lib/api',
  plugins: ['@hey-api/client-fetch'],
});