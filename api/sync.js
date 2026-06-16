// api/sync.js

export default async function handler(req, res) {
  const { id } = req.query;

  try {
    // Enable CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method === 'POST' && !id) {
      // Create new jsonBlob
      const response = await fetch('https://jsonblob.com/api/jsonBlob', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(req.body)
      });
      if (!response.ok) {
        throw new Error(`Failed to create blob: ${response.statusText}`);
      }
      const location = response.headers.get('Location');
      if (!location) {
        throw new Error("Missing Location header from jsonblob.com");
      }
      const blobId = location.split('/').pop();
      return res.status(201).json({ id: blobId });
    }

    if (!id) {
      return res.status(400).send("Missing sync session id");
    }

    const targetUrl = `https://jsonblob.com/api/jsonBlob/${id}`;

    if (req.method === 'POST' || req.method === 'PUT') {
      const response = await fetch(targetUrl, {
        method: 'PUT', // jsonblob.com uses PUT for updates
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(req.body)
      });
      if (!response.ok) {
        throw new Error(`Failed to save state: ${response.statusText}`);
      }
      const data = await response.json();
      return res.status(200).json(data);
    } else if (req.method === 'GET') {
      const response = await fetch(targetUrl);
      if (!response.ok) {
        if (response.status === 404) {
          return res.status(404).json({ error: "Sync session not found" });
        }
        throw new Error(`Failed to pull state: ${response.statusText}`);
      }
      const data = await response.json();
      return res.status(200).json(data);
    } else {
      return res.status(405).send("Method Not Allowed");
    }
  } catch (err) {
    console.error("Vercel Proxy Sync error:", err);
    return res.status(500).json({ error: err.message });
  }
}
