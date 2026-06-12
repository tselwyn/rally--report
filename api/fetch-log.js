export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "Missing url parameter" });

  let target;
  try {
    target = new URL(url);
  } catch {
    return res.status(400).json({ error: "That doesn't look like a valid link" });
  }

  const allowed = /(^|\.)tennisrungs\.com$/i.test(target.hostname);
  if (!allowed) {
    return res
      .status(400)
      .json({ error: "Only tennisrungs.com match log links are supported right now" });
  }

  try {
    const r = await fetch(target.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0 Safari/537.36",
      },
    });
    if (!r.ok) {
      return res
        .status(502)
        .json({ error: `Couldn't load that page (status ${r.status})` });
    }
    const html = await r.text();
    res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    return res.status(200).json({ html });
  } catch (e) {
    return res.status(502).json({ error: "Couldn't reach that page. Try again." });
  }
}
