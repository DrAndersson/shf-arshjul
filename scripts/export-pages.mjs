import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";

const basePath = "/shf-arshjul";
const clientDir = join(process.cwd(), "dist/client");
const outputDir = join(process.cwd(), ".pages-dist");

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
};

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });
await cp(clientDir, outputDir, { recursive: true });
await cp(join(outputDir, "shf-arshjul/_next"), join(outputDir, "_next"), { recursive: true });
await rm(join(outputDir, "shf-arshjul"), { recursive: true, force: true });

const app = (await import(join(process.cwd(), "dist/server/index.js"))).default;

async function fetchAsset(request) {
  const url = new URL(request.url);
  const relativePath = decodeURIComponent(url.pathname)
    .replace(new RegExp(`^${basePath}/?`), "")
    .replace(/^\/+/, "");
  try {
    const body = await readFile(join(clientDir, relativePath));
    return new Response(body, {
      headers: { "content-type": contentTypes[extname(relativePath)] || "application/octet-stream" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

const env = { ASSETS: { fetch: fetchAsset } };
const executionContext = {
  passThroughOnException() {},
  waitUntil(promise) { Promise.resolve(promise).catch(() => {}); },
};
const routes = [
  { path: `${basePath}/`, file: "index.html" },
  { path: `${basePath}/test-visualisering/`, file: "test-visualisering/index.html" },
];

for (const route of routes) {
  const response = await app.fetch(new Request(`https://drandersson.github.io${route.path}`), env, executionContext);
  if (!response.ok) throw new Error(`Could not render ${route.path}: ${response.status}`);
  const html = await response.text();
  const destination = join(outputDir, route.file);
  await mkdir(join(destination, ".."), { recursive: true });
  await writeFile(destination, html);
}

await writeFile(join(outputDir, ".nojekyll"), "");
