// api/sync.js
import { list, put, get } from '@vercel/blob';

// Helper to check if Vercel Blob is configured
const hasBlobToken = () => !!process.env.BLOB_READ_WRITE_TOKEN;

// Generic DB GET
async function dbGet(id) {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const url = `${process.env.SUPABASE_URL}/rest/v1/tournaments?id=eq.${id}&select=data`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Accept': 'application/json'
      }
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Supabase error: ${res.statusText}`);
    }
    const rows = await res.json();
    return rows.length > 0 ? rows[0].data : null;
  }

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(['GET', `tournament:${id}`])
    });
    if (!res.ok) {
      throw new Error(`Redis error: ${res.statusText}`);
    }
    const result = await res.json();
    if (!result.result) return null;
    return JSON.parse(result.result);
  }

  if (hasBlobToken()) {
    const { blobs } = await list({ prefix: `tournaments/${id}.json` });
    if (blobs.length === 0) return null;
    const { stream } = await get(blobs[0].url, { access: 'private' });
    return await new Response(stream).json();
  }

  throw new Error("No database or storage providers configured. Set SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY, UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN, or BLOB_READ_WRITE_TOKEN.");
}

// Generic DB PUT
async function dbPut(id, data) {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const url = `${process.env.SUPABASE_URL}/rest/v1/tournaments`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({ id, data })
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Supabase put error: ${res.statusText} - ${errText}`);
    }
    return;
  }

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(['SET', `tournament:${id}`, JSON.stringify(data)])
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Redis put error: ${res.statusText} - ${errText}`);
    }
    return;
  }

  if (hasBlobToken()) {
    await put(`tournaments/${id}.json`, JSON.stringify(data), {
      access: 'private',
      addRandomSuffix: false
    });
    return;
  }

  throw new Error("No database or storage providers configured. Set SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY, UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN, or BLOB_READ_WRITE_TOKEN.");
}

// Generic Registry GET
async function registryGet(id) {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const url = `${process.env.SUPABASE_URL}/rest/v1/registry?id=eq.${id}&select=target_id`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Accept': 'application/json'
      }
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Supabase registry error: ${res.statusText}`);
    }
    const rows = await res.json();
    return rows.length > 0 ? rows[0].target_id : null;
  }

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(['GET', `registry:${id}`])
    });
    if (!res.ok) {
      throw new Error(`Redis registry error: ${res.statusText}`);
    }
    const result = await res.json();
    return result.result || null;
  }

  if (hasBlobToken()) {
    const { blobs } = await list({ prefix: 'registry.json' });
    if (blobs.length > 0) {
      const { stream } = await get(blobs[0].url, { access: 'private' });
      const registry = await new Response(stream).json();
      return registry[id] || null;
    }
  }
  return null;
}

// Generic Registry PUT
async function registryPut(id, targetId) {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const url = `${process.env.SUPABASE_URL}/rest/v1/registry`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify({ id, target_id: targetId })
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Supabase registry put error: ${res.statusText} - ${errText}`);
    }
    return;
  }

  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(['SET', `registry:${id}`, targetId])
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Redis registry put error: ${res.statusText} - ${errText}`);
    }
    return;
  }

  if (hasBlobToken()) {
    const { blobs } = await list({ prefix: 'registry.json' });
    let registry = {};
    if (blobs.length > 0) {
      const { stream } = await get(blobs[0].url, { access: 'private' });
      registry = await new Response(stream).json();
    }
    registry[id] = targetId;
    await put('registry.json', JSON.stringify(registry), {
      access: 'private',
      addRandomSuffix: false
    });
  }
}

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

      await dbPut(newId, req.body);
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
        const mappedId = await registryGet(id);
        if (mappedId) {
          targetId = mappedId;
        } else {
          if (req.method === 'POST' || req.method === 'PUT') {
            const randomHex = () => Math.random().toString(16).substring(2, 10);
            const newId = `tournament-${randomHex()}-${randomHex()}`;

            await dbPut(newId, req.body);
            await registryPut(id, newId);

            return res.status(200).json(req.body);
          } else if (req.method === 'GET') {
            return res.status(404).json({ error: "Sync session not found" });
          }
        }
      } catch (err) {
        console.error("Registry mapping failed:", err);
        return res.status(500).json({ error: `Legacy mapping error: ${err.message}` });
      }
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      await dbPut(targetId, req.body);
      return res.status(200).json(req.body);
    } else if (req.method === 'GET') {
      const data = await dbGet(targetId);
      if (!data) {
        return res.status(404).json({ error: "Sync session not found" });
      }
      return res.status(200).json(data);
    } else {
      return res.status(405).send("Method Not Allowed");
    }
  } catch (err) {
    console.error("Sync proxy error:", err);
    return res.status(500).json({ error: err.message });
  }
}

