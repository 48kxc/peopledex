import { NextResponse } from 'next/server'

const API_KEY = process.env.OPENROUTER_API_KEY

export async function POST() {
  if (!API_KEY) return NextResponse.json({ error: 'OPENROUTER_API_KEY not set' }, { status: 500 })

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemma-3-12b-it',
        messages: [{
          role: 'user',
          content: `Generate 5 DIVERSE and UNIQUE quests for a photo-collection game where players take pictures of people. Each quest describes a visual trait to spot ON THE PERSON THEMSELVES — clothing, accessories, items they're holding, hairstyle, glasses, headphones, shoes, etc. Never reference backgrounds, lighting, shadows, or settings. Only things ON or BEING WORN BY the person.

CRITICAL: Every quest must be UNIQUE from every other. No two quests should describe similar items. Vary across categories: headwear, eyewear, footwear, tops, bottoms, outerwear, accessories, handheld items, hair, tattoos, bags, jewelry, pets/animals with the person, sports equipment, umbrellas, musical instruments, books, food/drinks, tools.

XP distribution is VERY IMPORTANT:
- 3 quests MUST be easy/common (100-150 XP): glasses, hat, headphones, phone in hand, backpack, sneakers, hoodie, watch, shorts, T-shirt, earbuds, baseball cap
- 1 quest medium (150-200 XP): specific color clothing, umbrella, dog on leash, bike, skateboard, coffee cup, beard, long hair
- 1 quest hard (200-350 XP): two traits combined, musical instrument, person with a baby/stroller, unique hairstyle color, formal suit, person on crutches, wheelchair

Return STRICT JSON array only, no markdown, no code blocks:
[{"title": "Short Name", "description": "One sentence about the person's trait", "type": "visual", "xpReward": 150}]`,
        }],
        max_tokens: 800,
        temperature: 1.0,
      }),
    })

    if (!res.ok) return NextResponse.json({ error: `OpenRouter ${res.status}` }, { status: 502 })

    const data: any = await res.json()
    const content = data.choices?.[0]?.message?.content || ''
    let quests: any[] = []
    try { const m = content.match(/\[[\s\S]*\]/); if (m) quests = JSON.parse(m[0]) } catch {}

    return NextResponse.json({ quests })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 502 })
  }
}