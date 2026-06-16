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

    // REGISTRY FOR LEGACY KEYS
    const REGISTRY_BLOB_ID = '019ed239-62d5-7bdb-a813-68924f83bb63';
    const REGISTRY_URL = `https://jsonblob.com/api/jsonBlob/${REGISTRY_BLOB_ID}`;
    let targetBlobId = id;
    const isLegacy = id.startsWith('gnr-');

    if (isLegacy) {
      try {
        const registryRes = await fetch(REGISTRY_URL);
        if (!registryRes.ok) {
          throw new Error(`Failed to fetch registry: ${registryRes.statusText}`);
        }
        const registry = await registryRes.json();

        if (registry[id]) {
          targetBlobId = registry[id];
        } else {
          if (req.method === 'POST' || req.method === 'PUT') {
            const createRes = await fetch('https://jsonblob.com/api/jsonBlob', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify(req.body)
            });
            if (!createRes.ok) {
              throw new Error(`Failed to create blob for legacy ID: ${createRes.statusText}`);
            }
            const location = createRes.headers.get('Location');
            if (!location) {
              throw new Error("Missing Location header from jsonblob.com");
            }
            targetBlobId = location.split('/').pop();

            registry[id] = targetBlobId;
            const updateRes = await fetch(REGISTRY_URL, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify(registry)
            });
            if (!updateRes.ok) {
              console.error("Failed to update registry mapping:", updateRes.statusText);
            }

            return res.status(200).json(req.body);
          } else if (req.method === 'GET') {
            return res.status(404).json({ error: "Sync session not found" });
          }
        }
      } catch (err) {
        console.error("Registry/Legacy sync mapping failed:", err);
        return res.status(500).json({ error: `Legacy mapping error: ${err.message}` });
      }
    }

    const targetUrl = `https://jsonblob.com/api/jsonBlob/${targetBlobId}`;

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
