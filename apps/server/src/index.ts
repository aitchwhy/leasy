import { Hono } from "hono";
import { ROOT_RESPONSE } from "./constants";
import db from "./db.json";

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

export default app;
