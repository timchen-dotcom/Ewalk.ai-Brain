import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import vm from "node:vm";

function pass(message) {
  console.log(`ok - ${message}`);
}

function fail(message) {
  console.error(`fail - ${message}`);
  process.exitCode = 1;
}

function assert(condition, message) {
  if (condition) pass(message);
  else fail(message);
}

const syntax = spawnSync(process.execPath, ["--check", "app.js"], { encoding: "utf8" });
assert(syntax.status === 0, "app.js syntax check");
if (syntax.stderr) console.error(syntax.stderr.trim());

const html = readFileSync("index.html", "utf8");
assert(html.includes("./seed-data.js"), "index.html loads seed-data.js");
assert(html.includes("./app.js"), "index.html loads app.js");
assert(html.includes("staffLoginSelect"), "staff selector exists");

const seedSource = readFileSync("seed-data.js", "utf8");
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(seedSource, sandbox);

const data = sandbox.window.TheDaySeedData;
assert(Boolean(data), "seed data is available");
assert(data.stores?.length === 5, "TheDay store count is 5");
assert(data.products?.length === 359, "TheDay product count is 359");

const staffCount = data.stores.reduce((total, store) => total + (store.staff || []).length, 0);
const brandCount = new Set(data.products.map((product) => product.brand)).size;
const pricedCount = data.products.filter((product) => Number(product.price) > 0).length;

assert(staffCount === 31, "TheDay staff count is 31");
assert(brandCount === 14, "TheDay brand/series count is 14");
assert(pricedCount === 0, "price column is still intentionally pending");

const vercelConfig = JSON.parse(readFileSync("vercel.json", "utf8"));
const hasNoIndex = JSON.stringify(vercelConfig).includes("noindex, nofollow");
assert(hasNoIndex, "Vercel preview remains noindex");

if (process.exitCode) process.exit(process.exitCode);
