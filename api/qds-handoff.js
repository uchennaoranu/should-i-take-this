module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const endpoint = process.env.QDS_HANDOFF_URL;
  const secret = process.env.QDS_HANDOFF_SECRET;
  if (!endpoint || !secret) return res.status(503).json({ error: "The optional QDS handoff is not configured." });
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const allowed = ["DST_LITE", "DST_FULL", "DSR", "DA"];
    if (!body || !allowed.includes(body.sourceTool) || typeof body.sourceRunId !== "string") return res.status(400).json({ error: "Invalid handoff payload" });
    const target = new URL("/api/handoffs", endpoint).toString();
    const response = await fetch(target, {
      method: "POST",
      headers: { "content-type": "application/json", "x-qds-handoff-secret": secret },
      body: JSON.stringify(body)
    });
    const text = await response.text();
    res.status(response.status).setHeader("content-type", "application/json");
    return res.send(text);
  } catch (error) {
    return res.status(502).json({ error: "The QDS handoff could not be reached." });
  }
};
