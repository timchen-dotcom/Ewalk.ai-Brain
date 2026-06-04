import { json } from "./_utils.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") return json(res, 405, { error: "Method not allowed" });
  return json(res, 410, {
    error: "Ashun live voice site is closed.",
    disabled: true
  });
}
