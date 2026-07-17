// Cloudflare Pages Function — POST /api/generate-quests
export async function onRequestPost(context: any) {
  const apiKey = context.env.OPENROUTER_API_KEY
  if (!apiKey) return json({ error: 'OPENROUTER_API_KEY not set' }, 500)
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemma-3-12b-it',
        messages: [{ role: 'user', content: 'Generate 5 diverse visual quests for a people photo-collection game. Only reference traits on a person: clothing, accessories, hairstyle, held items, or equipment. Return strict JSON array only: [{"title":"Short Name","description":"One sentence","type":"visual","xpReward":150}]. Vary easy, medium, and hard rewards from 100 to 350 XP.' }],
        max_tokens: 800,
        temperature: 1,
      }),
    })
    if (!res.ok) return json({ error: `OpenRouter ${res.status}` }, 502)
    const data: any = await res.json()
    const content = data.choices?.[0]?.message?.content || ''
    let quests: any[] = []
    try { const match = content.match(/\[[\s\S]*\]/); if (match) quests = JSON.parse(match[0]) } catch {}
    return json({ quests })
  } catch (error: any) { return json({ error: error.message }, 502) }
}

function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } })
}
