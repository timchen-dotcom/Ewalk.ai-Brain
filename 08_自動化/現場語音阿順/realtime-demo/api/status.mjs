import { json } from "./_utils.mjs";

export default async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error: "Method not allowed" });
  return json(res, 200, {
    ok: true,
    disabled: true,
    message: "Ashun live voice site is closed."
  });
}
