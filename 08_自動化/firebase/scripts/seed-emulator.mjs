#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const projectId = process.env.FIREBASE_PROJECT_ID || "ewalk-ai-system-prod";
const firestoreHost = process.env.FIRESTORE_EMULATOR_HOST || "127.0.0.1:18080";
const baseUrl = `http://${firestoreHost}/v1/projects/${projectId}/databases/(default)/documents`;
const scriptDir = dirname(fileURLToPath(import.meta.url));
const firebaseDir = resolve(scriptDir, "..");
const seedPath = resolve(firebaseDir, "seed/phase0-sample-data.json");
const emitCurlLines = process.argv.includes("--curl-lines");
const emulatorAdminHeaders = {
  "authorization": "Bearer owner",
  "content-type": "application/json",
};

function toFirestoreValue(value) {
  if (value === "serverTimestamp") {
    return { timestampValue: new Date().toISOString() };
  }

  if (value === null) {
    return { nullValue: null };
  }

  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(toFirestoreValue) } };
  }

  if (typeof value === "boolean") {
    return { booleanValue: value };
  }

  if (typeof value === "number") {
    return Number.isInteger(value) ? { integerValue: value } : { doubleValue: value };
  }

  if (typeof value === "string") {
    return { stringValue: value };
  }

  if (typeof value === "object") {
    return {
      mapValue: {
        fields: Object.fromEntries(
          Object.entries(value).map(([key, childValue]) => [key, toFirestoreValue(childValue)]),
        ),
      },
    };
  }

  throw new Error(`Unsupported seed value: ${String(value)}`);
}

function toFirestoreDocument(data) {
  return {
    fields: Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, toFirestoreValue(value)]),
    ),
  };
}

async function assertEmulatorIsRunning() {
  try {
    const response = await fetch(`${baseUrl}:listCollectionIds`, {
      method: "POST",
      headers: emulatorAdminHeaders,
      body: JSON.stringify({ pageSize: 1 }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (error) {
    throw new Error(
      `Firestore Emulator 沒有回應。請先雙擊「啟動FirebaseEmulator.command」後再匯入。原始訊息：${error.message}`,
    );
  }
}

async function putDocument(collectionId, documentId, documentData) {
  const encodedCollectionId = encodeURIComponent(collectionId);
  const encodedDocumentId = encodeURIComponent(documentId);
  const response = await fetch(`${baseUrl}/${encodedCollectionId}/${encodedDocumentId}`, {
    method: "PATCH",
    headers: emulatorAdminHeaders,
    body: JSON.stringify(toFirestoreDocument(documentData)),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`${collectionId}/${documentId} 寫入失敗：HTTP ${response.status} ${detail}`);
  }
}

const seed = JSON.parse(await readFile(seedPath, "utf8"));

if (emitCurlLines) {
  for (const [collectionId, documents] of Object.entries(seed)) {
    for (const [documentId, documentData] of Object.entries(documents)) {
      const encodedCollectionId = encodeURIComponent(collectionId);
      const encodedDocumentId = encodeURIComponent(documentId);
      const body = JSON.stringify(toFirestoreDocument(documentData));
      const bodyBase64 = Buffer.from(body, "utf8").toString("base64");
      console.log(`${baseUrl}/${encodedCollectionId}/${encodedDocumentId}\t${collectionId}/${documentId}\t${bodyBase64}`);
    }
  }
  process.exit(0);
}

await assertEmulatorIsRunning();

let count = 0;
for (const [collectionId, documents] of Object.entries(seed)) {
  for (const [documentId, documentData] of Object.entries(documents)) {
    await putDocument(collectionId, documentId, documentData);
    count += 1;
    console.log(`已匯入：${collectionId}/${documentId}`);
  }
}

console.log("");
console.log(`完成：已匯入 ${count} 筆 Phase 0 測試資料到本機 Firestore Emulator。`);
console.log(`Emulator UI：http://127.0.0.1:14000/firestore`);
