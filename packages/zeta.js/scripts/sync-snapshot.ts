import { readdir } from "node:fs/promises";
import { resolve, relative } from "node:path";

// Read saved first-party definitions; never execute extracted application code.
const workspace = resolve(import.meta.dir, "../../../..");
const source = resolve(workspace, "analysis/android/v3.51.94/extracted");
const output = resolve(import.meta.dir, "../src/generated/endpoints.ts");
const fixturePath = resolve(import.meta.dir, "fixtures/snapshot-3.51.94-endpoints.json");
const check = Bun.argv.includes("--check");
const fromFixture = Bun.argv.includes("--from-fixture");
type Contract = { method: string; path: string; multipart: boolean; stream: boolean; response: string | null; source: string; line: number };
const endpoints: Record<string, Contract> = {};
if (fromFixture) Object.assign(endpoints, await Bun.file(fixturePath).json());
const definitions = new Set<string>();
for (const name of fromFixture ? [] : (await readdir(source)).sort()) {
  if (!name.endsWith(".js")) continue;
  const path = resolve(source, name);
  const text = await Bun.file(path).text();
  const local = new Map<string, Contract>();
  const descriptors = /(?:export\s+)?(?:const|let)\s+(\w+)\s*=\s*(\{\s*method:\s*"(GET|POST|PUT|PATCH|DELETE)",\s*url:\s*"(\/v\d+\/[^"\n]*)"[^\n]*?\});/g;
  for (const match of text.matchAll(descriptors)) {
    const [, variable, object, method, url] = match;
    if (!variable || !object || !method || !url) continue;
    const response = object.match(/responseClass:\s*[^,}]*\.([A-Za-z0-9_]+)/)?.[1] ?? null;
    const contract = {
      method, path: url, multipart: /multipart:\s*true/.test(object),
      stream: /\/stream(?:\/|$)/.test(url) || method === "POST" && /\/example-chat$/.test(url),
      response, source: relative(workspace, path), line: text.slice(0, match.index).split("\n").length,
    };
    local.set(variable, contract);
    definitions.add(`${method} ${url.replace(/:[A-Za-z0-9_]+/g, ":param").replace(/\/$/, "")}`);
    if (match[0].startsWith("export")) add(variable, contract);
  }
  for (const match of text.matchAll(/export const (\w+) = (\w+);/g)) {
    const contract = local.get(match[2]!);
    if (contract) add(match[1]!, contract);
  }
}
function add(exportName: string, contract: Contract): void {
  const name = exportName.replace(/Api$/, "");
  const existing = endpoints[name];
  if (existing && (existing.method !== contract.method || existing.path !== contract.path)) {
    throw new Error(`Conflicting source endpoint name: ${name}`);
  }
  endpoints[name] = contract;
}

// These three descriptors occur only in the saved Web chunks. Retain their
// exact server contracts alongside the Android definitions.
const webSource = "analysis/web/mirror/zeta-ai.io/_external/web-cdn.zeta-ai.io/_next/static/chunks/1m-e8rwvfiyzk.js";
if (!fromFixture) {
const web = await Bun.file(resolve(workspace, webSource)).text();
for (const [name, method, path, response] of [
  ["getBrandpayTerms", "GET", "/v1/toss-brandpay/terms", "WebBrandpayTermsResponse"],
  ["getBrandpayCustomer", "GET", "/v1/toss-brandpay/customer", "WebBrandpayCustomerResponse"],
  ["agreeBrandpayTerms", "POST", "/v1/toss-brandpay/terms/agree", null],
] as const) {
  if (!web.includes(`method:"${method}",url:"${path}"`)) throw new Error(`Missing Web contract: ${method} ${path}`);
  endpoints[name] = { method, path, multipart: false, stream: false, response, source: webSource, line: 2 };
}
}

const exported = new Set(Object.values(endpoints).map((e) => `${e.method} ${e.path.replace(/:[A-Za-z0-9_]+/g, ":param").replace(/\/$/, "")}`));
const missing = [...definitions].filter((key) => !exported.has(key));
if (missing.length) throw new Error(`Unexported source definitions require review:\n${missing.join("\n")}`);
const sorted = Object.fromEntries(Object.entries(endpoints).sort(([a], [b]) => a.localeCompare(b)));
const result = `// Generated from the saved Zeta 3.51.94 clients by scripts/sync-snapshot.ts.\n// Do not edit by hand. Source paths and lines are provenance, not runtime imports.\n\nexport const snapshotEndpoints = ${JSON.stringify(sorted, null, 2)} as const;\n\nexport type SnapshotEndpointName = keyof typeof snapshotEndpoints;\n`;
if (check) {
  if (!await Bun.file(output).exists() || await Bun.file(output).text() !== result) throw new Error("Snapshot endpoints are out of date; run bun scripts/sync-snapshot.ts");
} else {
  await Bun.write(fixturePath, JSON.stringify(sorted, null, 2) + "\n");
  await Bun.write(output, result);
}
console.log(`${check ? "Verified" : "Generated"} ${Object.keys(sorted).length} named endpoints (${exported.size} HTTP contracts).`);
