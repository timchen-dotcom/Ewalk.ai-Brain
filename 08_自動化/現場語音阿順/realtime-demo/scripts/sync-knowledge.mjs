import { syncKnowledgeSnapshots } from "../src/ashun-core.mjs";

const synced = await syncKnowledgeSnapshots();
for (const item of synced) {
  const status = item.missing ? "missing" : "synced";
  console.log(`${status}: ${item.snapshot}`);
}

if (synced.some((item) => item.missing)) {
  process.exitCode = 1;
}
