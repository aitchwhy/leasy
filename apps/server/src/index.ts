import { Hono } from "hono";
import { ROOT_RESPONSE } from "./constants";
import db from "./db.json";

import { PostHog } from "posthog-node";

const client = new PostHog("phc_qW23RO6Xu06MZkyQeJweNoyeEMLieSJrnVCfoY9bl7o", {
  host: "https://us.i.posthog.com",
});

client.capture({
  distinctId: "test-id",
  event: "test-event",
});

// Send queued events immediately. Use for example in a serverless environment
// where the program may terminate before everything is sent.
// Use `client.flush()` instead if you still need to send more events or fetch feature flags.
client.shutdown();

const app = new Hono();

// Health check
app.get("/", (c) => {
  return c.text(ROOT_RESPONSE);
});

// list all data (json-server DB)
app.get("/db", (c) => {
  return c.json(db);
});

// list buildings
app.get("/buildings", (c) => {
  return c.json(db.units);
});

export default {
  port: 4000,
  fetch: app.fetch,
};
