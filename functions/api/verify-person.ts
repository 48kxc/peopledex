// Cloudflare Pages Function — POST /api/verify-person
export async function onRequestPost(context: any) {
  const apiKey = context.env.OPENROUTER_API_KEY
  if (!apiKey) return json({ error: 'OPENROUTER_API_KEY not set' }, 500)
  let image: string
  try {
    const body = await context.request.json()
    image = body.image
    if (!image) return json({ error: 'Missing image' }, 400)
    image = image.replace(/^data:image\/\w+;base64,/, '')
  } catch { return json({ error: 'Invalid JSON' }, 400) }
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'google/gemma-3-12b-it', messages: [{ role: 'user', content: [{ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${image}` } }, { type: 'text', text: 'Does this image contain a person? Answer strict JSON only: {"isPerson":true} or {"isPerson":false}' }] }], max_tokens: 50, temperature: 0 }),
    })
    if (!res.ok) return json({ error: `OpenRouter ${res.status}` }, 502)
    const data: any = await res.json(); const content = data.choices?.[0]?.message?.content || ''
    let isPerson = false
    try { const match = content.match(/\{[\s\S]*\}/); if (match) isPerson = Boolean(JSON.parse(match[0]).isPerson) } catch {}
    return json({ isPerson, raw: content })
  } catch (error: any) { return json({ error: error.message }, 502) }
}

function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } })
}
