export default async function handler(req, res) {
  const { code } = req.query;
  const creds = Buffer.from(
    `${process.env.NOTION_CLIENT_ID}:${process.env.NOTION_CLIENT_SECRET}`
  ).toString('base64');

  const r = await fetch('https://api.notion.com/v1/oauth/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${creds}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28'
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.REDIRECT_URI
    })
  });

  const data = await r.json();
  if (data.access_token) {
    res.json({ token: data.access_token });
  } else {
    res.status(400).json({ error: data.error || 'Exchange failed' });
  }
}
