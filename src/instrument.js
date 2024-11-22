import * as sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { appEnv } from './utils/env.js';

sentry.init({
  dsn: appEnv.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: 1.0,
  disableInstrumentationWarnings: true
});
