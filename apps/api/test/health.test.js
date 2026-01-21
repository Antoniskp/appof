import test from "node:test";
import assert from "node:assert";
import Fastify from "fastify";

test("GET /health returns status ok", async () => {
  const app = Fastify();
  app.get("/health", async () => ({ status: "ok" }));

  const response = await app.inject({
    method: "GET",
    url: "/health"
  });

  assert.strictEqual(response.statusCode, 200);
  assert.deepStrictEqual(JSON.parse(response.body), { status: "ok" });
});
