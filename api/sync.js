// api/sync.js

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).send("Missing sync session id");
  }

  const targetUrl = `https://keyvalue.xyz/v1/${id}`;

  try {
    if (req.method === 'POST') {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(req.body)
      });
      if (!response.ok) {
        throw new Error(`Failed to save state to backend: ${response.statusText}`);
      }
      const text = await response.text();
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(response.status).send(text);
    } else if (req.method === 'GET') {
      const response = await fetch(targetUrl);
      if (!response.ok) {
        if (response.status === 404) {
          res.setHeader('Access-Control-Allow-Origin', '*');
          return res.status(404).json({ error: "Sync session not found" });
        }
        throw new Error(`Failed to pull state from backend: ${response.statusText}`);
      }
      const data = await response.json();
      res.setHeader('Access-Control-Allow-Origin', '*');
      return res.status(200).json(data);
    } else if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      return res.status(200).end();
    } else {
      return res.status(405).send("Method Not Allowed");
    }
  } catch (err) {
    console.error("Vercel Proxy Sync error:", err);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({ error: err.message });
  }
}
