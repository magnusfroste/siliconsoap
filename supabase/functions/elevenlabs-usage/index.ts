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

    // Fetch subscription info (includes character usage)
    const subResponse = await fetch('https://api.elevenlabs.io/v1/user/subscription', {
      headers: { 'xi-api-key': apiKey },
    })

    if (!subResponse.ok) {
      throw new Error(`ElevenLabs API error: ${subResponse.status}`)
    }

    const subscription = await subResponse.json()

    // Fetch user info
    const userResponse = await fetch('https://api.elevenlabs.io/v1/user', {
      headers: { 'xi-api-key': apiKey },
    })

    const user = userResponse.ok ? await userResponse.json() : null

    return new Response(
      JSON.stringify({
        tier: subscription.tier,
        characterCount: subscription.character_count,
        characterLimit: subscription.character_limit,
        characterUsagePercent: subscription.character_limit > 0
          ? Math.round((subscription.character_count / subscription.character_limit) * 100)
          : 0,
        nextResetUnix: subscription.next_character_count_reset_unix,
        status: subscription.status,
        currency: subscription.currency,
        hasOpenInvoices: subscription.has_open_invoices,
        nextInvoice: subscription.next_invoice,
        voiceSlotsUsed: subscription.voice_slots_used,
        maxVoiceAddEdits: subscription.max_voice_add_edits,
        voiceAddEditCounter: subscription.voice_add_edit_counter,
        canExtendCharacterLimit: subscription.can_extend_character_limit,
        userName: user?.first_name || null,
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
