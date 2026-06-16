// api/sync.js
import { list, put } from '@vercel/blob';

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
      // Create new tournament session
      const randomHex = () => Math.random().toString(16).substring(2, 10);
      const newId = `tournament-${randomHex()}-${randomHex()}`;

      await put(`tournaments/${newId}.json`, JSON.stringify(req.body), {
        access: 'public',
        addRandomSuffix: false
      });

      return res.status(201).json({ id: newId });
    }

    if (!id) {
      return res.status(400).send("Missing sync session id");
    }

    // REGISTRY FOR LEGACY KEYS
    let targetId = id;
    const isLegacy = id.startsWith('gnr-');

    if (isLegacy) {
      try {
        const { blobs } = await list({ prefix: 'registry.json' });
        let registry = {};
        if (blobs.length > 0) {
          const registryRes = await fetch(blobs[0].url);
          if (registryRes.ok) {
            registry = await registryRes.json();
          }
        }

        if (registry[id]) {
          targetId = registry[id];
        } else {
          if (req.method === 'POST' || req.method === 'PUT') {
            const randomHex = () => Math.random().toString(16).substring(2, 10);
            const newId = `tournament-${randomHex()}-${randomHex()}`;

            await put(`tournaments/${newId}.json`, JSON.stringify(req.body), {
              access: 'public',
              addRandomSuffix: false
            });

            registry[id] = newId;
            await put('registry.json', JSON.stringify(registry), {
              access: 'public',
              addRandomSuffix: false
            });

            return res.status(200).json(req.body);
          } else if (req.method === 'GET') {
            return res.status(404).json({ error: "Sync session not found" });
          }
        }
      } catch (err) {
        console.error("Vercel Blob registry mapping failed:", err);
        return res.status(500).json({ error: `Legacy mapping error: ${err.message}` });
      }
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      await put(`tournaments/${targetId}.json`, JSON.stringify(req.body), {
        access: 'public',
        addRandomSuffix: false
      });
      return res.status(200).json(req.body);
    } else if (req.method === 'GET') {
      const { blobs } = await list({ prefix: `tournaments/${targetId}.json` });
      if (blobs.length === 0) {
        return res.status(404).json({ error: "Sync session not found" });
      }
      const response = await fetch(blobs[0].url);
      if (!response.ok) {
        throw new Error(`Failed to fetch state: ${response.statusText}`);
      }
      const data = await response.json();
      return res.status(200).json(data);
    } else {
      return res.status(405).send("Method Not Allowed");
    }
  } catch (err) {
    console.error("Vercel Blob Sync proxy error:", err);
    return res.status(500).json({ error: err.message });
  }
}
