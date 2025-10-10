export default function handler(req, res) {
  res.status(200).json({ ok: true, runtime: "node20" });
}
export const config = { runtime: "nodejs20.x" };
