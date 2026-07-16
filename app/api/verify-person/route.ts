// POST /api/verify-person
// Takes a base64 image, calls OpenRouter VL model, returns whether it's a full-body person

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'OPENROUTER_API_KEY not set' }, { status: 500 })
  }

  let imageBase64: string
  try {
    const body = await request.json()
    imageBase64 = body.image
    if (!imageBase64) {
      return Response.json({ error: 'Missing image field' }, { status: 400 })
    }
    // Strip data: prefix if present — OpenRouter wants raw base64
    const dataUrlMatch = imageBase64.match(/^data:image\/\w+;base64,(.+)$/)
    if (dataUrlMatch) {
      imageBase64 = dataUrlMatch[1]
    }
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
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
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
              {
                type: 'text',
                text: 'Look at this image and determine if it contains a PERSON with their FULL BODY visible (head to feet). Answer with STRICT JSON only: {"isPerson": true, "fullBody": true} or {"isPerson": false, "fullBody": false}. If there is a person but only partial body (e.g. just face, just upper body), set isPerson true and fullBody false. Output ONLY valid JSON, no other text.',
              },
            ],
          },
        ],
        max_tokens: 100,
        temperature: 0,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      return Response.json({ error: `OpenRouter error: ${response.status}`, detail: errText }, { status: 502 })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || ''

    // Extract JSON from response
    let result: { isPerson: boolean; fullBody: boolean }
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : { isPerson: false, fullBody: false }
    } catch {
      result = { isPerson: false, fullBody: false }
    }

    return Response.json({
      isPerson: result.isPerson ?? false,
      fullBody: result.fullBody ?? false,
      raw: content,
    })
  } catch (err: any) {
    return Response.json({ error: 'Request failed', detail: err.message }, { status: 502 })
  }
}
