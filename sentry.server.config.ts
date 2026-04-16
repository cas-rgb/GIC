import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "https://local-placeholder@o00000.ingest.sentry.io/000000",
  tracesSampleRate: 1.0,
  debug: false,
});
