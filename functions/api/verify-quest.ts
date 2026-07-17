// Cloudflare Pages Function — POST /api/verify-quest
export async function onRequestPost(context: any) {
  const apiKey = context.env.OPENROUTER_API_KEY
  if (!apiKey) return json({ error: 'OPENROUTER_API_KEY not set' }, 500)
  let image: string, questTitle: string, questDescription: string, questType: string
  try {
    const body = await context.request.json()
    image = body.image; questTitle = body.questTitle; questDescription = body.questDescription; questType = body.questType
    if (!image || !questTitle) return json({ error: 'Missing fields' }, 400)
    image = image.replace(/^data:image\/\w+;base64,/, '')
  } catch { return json({ error: 'Invalid JSON' }, 400) }
  const prompt = questType === 'capture_color' ? 'Does the person appear to be wearing blue clothing or accessories?' : questType === 'capture_backpack' ? 'Is the person wearing or carrying a backpack?' : `Quest: "${questTitle}" — ${questDescription}. Does this photo satisfy the quest?`
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'google/gemma-3-12b-it', messages: [{ role: 'user', content: [{ type: 'image_url', image_url: { url: `data:image/jpeg;base64,${image}` } }, { type: 'text', text: `${prompt}\nOnly answer YES when clearly visible. Respond strict JSON only: {"answer":"YES"} or {"answer":"NO"}` }] }], max_tokens: 50, temperature: 0 }),
    })
    if (!res.ok) return json({ error: `OpenRouter ${res.status}` }, 502)
    const data: any = await res.json(); const content = data.choices?.[0]?.message?.content || ''
    let answer = 'NO'
    try { const match = content.match(/\{[\s\S]*\}/); if (match) answer = JSON.parse(match[0]).answer || 'NO' } catch {}
    return json({ answer, raw: content })
  } catch (error: any) { return json({ error: error.message }, 502) }
}

function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } })
}
