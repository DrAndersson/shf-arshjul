import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server renders the SHF board portal", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>SHF Årshjul/);
  assert.match(html, /Föreningens arbete/);
  assert.match(html, /STYRELSENS PULS/);
  assert.match(html, /Ordförande/);
  assert.match(html, /Vetenskaplig sekreterare/);
  assert.match(html, /Årsredovisning till revisorerna/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape/);
});
