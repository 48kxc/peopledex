// Cloudflare Pages Function — POST /api/verify-quest
// Takes image + quest details, calls VL model, returns YES/NO

export async function onRequestPost(context: any) {
  const apiKey = context.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'OPENROUTER_API_KEY not set' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }

  let imageBase64: string, questTitle: string, questDescription: string, questType: string
  try {
    const body = await context.request.json()
    imageBase64 = body.image; questTitle = body.questTitle; questDescription = body.questDescription; questType = body.questType
    if (!imageBase64 || !questTitle) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }
    const m = imageBase64.match(/^data:image\/\w+;base64,(.+)$/)
    if (m) imageBase64 = m[1]
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }

  let prompt: string
  switch (questType) {
    case 'capture_color': prompt = 'Does the person in this photo appear to be wearing BLUE clothing or accessories?'; break
    case 'capture_backpack': prompt = 'Is the person in this photo wearing or carrying a BACKPACK?'; break
    default: prompt = `Quest: "${questTitle}" — ${questDescription}. Does this photo satisfy the quest?`
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemma-3-12b-it',
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
            { type: 'text', text: `${prompt}\n\nCRITICAL RULES:\n- Only answer YES if the trait/object is CLEARLY VISIBLE and UNMISTAKABLE in the photo.\n- If the relevant body part or item is NOT VISIBLE (e.g. back not shown, feet cropped out), answer NO.\n- Do NOT guess, infer, or assume based on context. You must SEE it.\n- If there is any ambiguity or doubt, answer NO.\n- A backpack must be VISIBLE on the person's back or shoulders. If you cannot see their back, answer NO.\n- Clothing colors must be clearly identifiable, not speculated from shadows.\n- Default to NO unless 100% certain.\n\nRespond STRICT JSON only: {"answer": "YES"} or {"answer": "NO"}` },
          ],
        }],
        max_tokens: 50,
        temperature: 0,
      }),
    })

    if (!res.ok) {
      return new Response(JSON.stringify({ error: `OpenRouter ${res.status}` }), { status: 502, headers: { 'Content-Type': 'application/json' } })
    }

    const data: any = await res.json()
    const content = data.choices?.[0]?.message?.content || ''
    let answer: string = 'NO'
    try { const m = content.match(/\{[\s\S]*\}/); if (m) answer = JSON.parse(m[0]).answer || 'NO' } catch {}

    return new Response(JSON.stringify({ answer, raw: content }), { headers: { 'Content-Type': 'application/json' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 502, headers: { 'Content-Type': 'application/json' } })
  }
}
