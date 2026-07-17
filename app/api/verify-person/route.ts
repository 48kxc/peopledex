import { NextResponse } from 'next/server'

const API_KEY = process.env.OPENROUTER_API_KEY

export async function POST(req: Request) {
  if (!API_KEY) return NextResponse.json({ error: 'OPENROUTER_API_KEY not set' }, { status: 500 })

  let imageBase64: string
  try {
    const body = await req.json()
    imageBase64 = body.image
    if (!imageBase64) return NextResponse.json({ error: 'Missing image' }, { status: 400 })
    const m = imageBase64.match(/^data:image\/\w+;base64,(.+)$/)
    if (m) imageBase64 = m[1]
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemma-3-12b-it',
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
            { type: 'text', text: 'Does this image contain a PERSON (human being)? Answer STRICT JSON only: {"isPerson": true} or {"isPerson": false}' },
          ],
        }],
        max_tokens: 50,
        temperature: 0,
      }),
    })

    if (!res.ok) return NextResponse.json({ error: `OpenRouter ${res.status}` }, { status: 502 })

    const data: any = await res.json()
    const content = data.choices?.[0]?.message?.content || ''
    let result = { isPerson: false }
    try { const m = content.match(/\{[\s\S]*\}/); if (m) result = JSON.parse(m[0]) } catch {}

    return NextResponse.json({ isPerson: result.isPerson ?? false, raw: content })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 })
  }
}