// Cloudflare Pages Function — POST /api/verify-person
// Takes base64 image, calls OpenRouter VL model, returns person/fullBody check

export async function onRequestPost(context: any) {
  const apiKey = context.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'OPENROUTER_API_KEY not set' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  let imageBase64: string
  try {
    const body = await context.request.json()
    imageBase64 = body.image
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: 'Missing image' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }
    const m = imageBase64.match(/^data:image\/\w+;base64,(.+)$/)
    if (m) imageBase64 = m[1]
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemma-3-12b-it',
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
            { type: 'text', text: 'Look at this image. Does it contain a PERSON with FULL BODY visible (head to feet)? Answer STRICT JSON only: {"isPerson": true, "fullBody": true} or {"isPerson": false, "fullBody": false}. If partial body, set isPerson true and fullBody false.' },
          ],
        }],
        max_tokens: 100,
        temperature: 0,
      }),
    })

    if (!res.ok) {
      return new Response(JSON.stringify({ error: `OpenRouter ${res.status}` }), { status: 502, headers: { 'Content-Type': 'application/json' } })
    }

    const data: any = await res.json()
    const content = data.choices?.[0]?.message?.content || ''
    let result = { isPerson: false, fullBody: false }
    try {
      const m = content.match(/\{[\s\S]*\}/)
      if (m) result = JSON.parse(m[0])
    } catch {}

    return new Response(JSON.stringify({ isPerson: result.isPerson ?? false, fullBody: result.fullBody ?? false, raw: content }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 502, headers: { 'Content-Type': 'application/json' } })
  }
}
