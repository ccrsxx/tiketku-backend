import { z } from 'zod';
import { transpile } from 'postman2openapi';
import { writeFile } from 'fs/promises';
import { validStringSchema } from '../utils/validation.js';

async function main() {
  const postmanEnvSchema = z.object({
    POSTMAN_API_KEY: validStringSchema,
    POSTMAN_COLLECTION_ID: validStringSchema
  });

  const { data: postmanEnv, error } = postmanEnvSchema.safeParse(process.env);

  if (error) {
    throw new Error(`Invalid environment variables: ${error.message}`);
  }

  const postmanCollectionResponse = await fetch(
    `https://api.getpostman.com/collections/${postmanEnv.POSTMAN_COLLECTION_ID}`,
    {
      headers: {
        'x-api-key': postmanEnv.POSTMAN_API_KEY
      }
    }
  );

  /**
   * @typedef {{
   *   collection: {
   *     info: Record<string, unknown>;
   *     item: Record<string, unknown>[];
   *   };
   * }} PostmanCollection
   */

  /** @type {PostmanCollection} */
  const { collection } = await postmanCollectionResponse.json();

  const openapi = transpile(collection);

  openapi.servers = [
    {
      url: 'https://api.tiketku.risalamin.com',
      description: 'Production server'
    },
    {
      url: 'http://localhost:4000',
      description: 'Local development server'
    }
  ];

  const stringifiedOpenapi = JSON.stringify(openapi, null, 2);

  await writeFile('./src/docs/openapi.json', stringifiedOpenapi);
}

void main();
