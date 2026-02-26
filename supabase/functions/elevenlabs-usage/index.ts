import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('ELEVENLABS_API_KEY')
    if (!apiKey) {
      throw new Error('ELEVENLABS_API_KEY not configured')
    }

    // Try subscription endpoint first, fall back to user endpoint
    let subscription = null
    let subError = false

    const subResponse = await fetch('https://api.elevenlabs.io/v1/user/subscription', {
      headers: { 'xi-api-key': apiKey },
    })

    if (subResponse.ok) {
      subscription = await subResponse.json()
    } else {
      subError = true
      console.log('Subscription endpoint returned', subResponse.status, '- falling back to /v1/user')
    }

    // Always fetch user info as fallback
    const userResponse = await fetch('https://api.elevenlabs.io/v1/user', {
      headers: { 'xi-api-key': apiKey },
    })

    if (!userResponse.ok) {
      throw new Error(`ElevenLabs API error: ${userResponse.status}`)
    }

    const user = await userResponse.json()

    // Build response from whichever source worked
    const sub = subscription || user.subscription || {}

    const characterCount = sub.character_count ?? 0
    const characterLimit = sub.character_limit ?? 0

    return new Response(
      JSON.stringify({
        tier: sub.tier ?? user.subscription?.tier ?? 'unknown',
        characterCount,
        characterLimit,
        characterUsagePercent: characterLimit > 0
          ? Math.round((characterCount / characterLimit) * 100)
          : 0,
        nextResetUnix: sub.next_character_count_reset_unix ?? null,
        status: sub.status ?? 'unknown',
        currency: sub.currency ?? null,
        hasOpenInvoices: sub.has_open_invoices ?? false,
        nextInvoice: sub.next_invoice ?? null,
        voiceSlotsUsed: sub.voice_slots_used ?? 0,
        maxVoiceAddEdits: sub.max_voice_add_edits ?? null,
        voiceAddEditCounter: sub.voice_add_edit_counter ?? 0,
        canExtendCharacterLimit: sub.can_extend_character_limit ?? false,
        userName: user.first_name ?? null,
        subscriptionEndpointAvailable: !subError,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('ElevenLabs usage error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
