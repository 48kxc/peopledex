// Cloudflare Pages Function — POST /api/generate-quests
// Calls OpenRouter to generate 5 new creative quests

export async function onRequestPost(context: any) {
  const apiKey = context.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'OPENROUTER_API_KEY not set' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemma-3-12b-it',
        messages: [{
          role: 'user',
          content: `Generate 5 creative quests for a "PeopleDex" game where players photograph people in the real world (no facial recognition, anonymous collectibles). Quests should involve spotting specific visual traits in photos — clothing items, accessories, colors, activities, settings, poses, or combinations.

Rules:
- Each quest must be verifiable from a SINGLE PHOTO
- Focus on VISIBLE traits only (clothing color, accessories, activity, setting)
- Make them varied and fun

Return STRICT JSON array only, no other text:
[
  {"title": "Short Name", "description": "What to look for in one sentence", "type": "visual", "xpReward": 150},
  ...
]

Example:
{"title": "Red Shoes", "description": "Spot someone wearing red shoes or sneakers", "type": "visual", "xpReward": 150}
{"title": "Dog Walker", "description": "Find someone walking a dog", "type": "visual", "xpReward": 200}
{"title": "Hat Person", "description": "Capture someone wearing any kind of hat", "type": "visual", "xpReward": 100}`,
        }],
        max_tokens: 500,
        temperature: 0.9,
      }),
    })

    if (!res.ok) {
      return new Response(JSON.stringify({ error: `OpenRouter ${res.status}` }), { status: 502, headers: { 'Content-Type': 'application/json' } })
    }

    const data: any = await res.json()
    const content = data.choices?.[0]?.message?.content || ''
    let quests: any[] = []
    try {
      const m = content.match(/\[[\s\S]*\]/)
      if (m) quests = JSON.parse(m[0])
    } catch {}

    return new Response(JSON.stringify({ quests }), { headers: { 'Content-Type': 'application/json' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 502, headers: { 'Content-Type': 'application/json' } })
  }
}