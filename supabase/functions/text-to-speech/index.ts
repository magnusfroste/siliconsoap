import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, voiceId } = await req.json()

    if (!text || !voiceId) {
      throw new Error('Text and voiceId are required')
    }

    const apiKey = Deno.env.get('ELEVENLABS_API_KEY')
    if (!apiKey) {
      throw new Error('ELEVENLABS_API_KEY not configured')
    }

    console.log('Generating speech:', { textLength: text.length, voiceId })

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_turbo_v2_5',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('ElevenLabs API error:', response.status, error)
      throw new Error(`ElevenLabs API error: ${response.status}`)
    }

    const audioBuffer = await response.arrayBuffer()
    
    // Convert to base64 in chunks to avoid stack overflow
    const uint8Array = new Uint8Array(audioBuffer)
    const chunkSize = 8192
    let binary = ''
    
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.slice(i, i + chunkSize)
      binary += String.fromCharCode(...chunk)
    }
    
    const base64Audio = btoa(binary)

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error('TTS error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
