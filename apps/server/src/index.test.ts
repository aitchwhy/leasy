import { describe, expect, it } from "vitest";
import { ROOT_RESPONSE } from "./constants";
import db from "./db.json";
import app from "./index";

describe("App", () => {
  it("GET / returns 200 OK", async () => {
    const res = await app.request("/");
    expect(res.ok).toBeTruthy();
    expect(await res.text()).toBe(ROOT_RESPONSE);
  });
});

describe("App Buildings", () => {
  it("GET /buildings returns list of buildings", async () => {
    const res = await app.request("/buildings");
    expect(res.ok).toBeTruthy();

    const buildings = (await res.json()) as typeof db.units;
    expect(buildings).toBeDefined();
    expect(buildings.length).toBe(db.units.length);
    expect(buildings).toEqual(db.units);
  });
});
