// POST /api/verify-quest
// Takes a base64 image + quest details, calls OpenRouter VL model, returns YES/NO

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'OPENROUTER_API_KEY not set' }, { status: 500 })
  }

  let imageBase64: string
  let questTitle: string
  let questDescription: string
  let questType: string
  try {
    const body = await request.json()
    imageBase64 = body.image
    questTitle = body.questTitle
    questDescription = body.questDescription
    questType = body.questType
    if (!imageBase64 || !questTitle) {
      return Response.json({ error: 'Missing fields' }, { status: 400 })
    }
    const match = imageBase64.match(/^data:image\/\w+;base64,(.+)$/)
    if (match) imageBase64 = match[1]
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Build a specific prompt based on quest type
  let specificPrompt = ''
  switch (questType) {
    case 'capture_color':
      specificPrompt = `Determine if the person in this photo appears to be wearing BLUE clothing or accessories.`
      break
    case 'capture_backpack':
      specificPrompt = `Determine if the person in this photo is wearing or carrying a BACKPACK.`
      break
    default:
      specificPrompt = `Determine if this photo satisfies the quest: "${questTitle}" — ${questDescription}`
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemma-3-12b-it',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
              },
              {
                type: 'text',
                text: `Quest: "${questTitle}" — ${questDescription}\n\n${specificPrompt}\n\nRespond with STRICT JSON only, no other text: {"answer": "YES"} or {"answer": "NO"}`,
              },
            ],
          },
        ],
        max_tokens: 50,
        temperature: 0,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      return Response.json({ error: `OpenRouter error: ${response.status}`, detail: errText }, { status: 502 })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''

    let answer: 'YES' | 'NO' = 'NO'
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        answer = parsed.answer === 'YES' ? 'YES' : 'NO'
      }
    } catch {}

    return Response.json({ answer, raw: content })
  } catch (err: any) {
    return Response.json({ error: 'Request failed', detail: err.message }, { status: 502 })
  }
}
