export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  const clientId     = process.env.NOTION_CLIENT_ID;
  const clientSecret = process.env.NOTION_CLIENT_SECRET;
  const redirectUri  = process.env.REDIRECT_URI;   // must match Notion integration EXACTLY

  if (!clientId || !clientSecret || !redirectUri) {
    return res.status(500).json({ error: 'Missing server configuration' });
  }

  const creds = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  let r;
  try {
    r = await fetch('https://api.notion.com/v1/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${creds}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        grant_type:   'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });
  } catch (err) {
    console.error('[token] fetch error:', err);
    return res.status(500).json({ error: 'Failed to reach Notion' });
  }

  const data = await r.json();

  if (data.access_token) {
    // Redirect the browser back to the app
    return res.redirect(302, `kando://callback?token=${data.access_token}`);
  }

  return res.status(400).json({
    error:            data.error,
    error_description: data.error_description,
    redirect_uri_used: redirectUri,
    notion_status:    r.status,
  });
}
