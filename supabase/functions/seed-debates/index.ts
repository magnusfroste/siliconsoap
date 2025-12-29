import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DEMO_BOT_EMAIL = 'ai-debates-bot@lovable.app';
const DEMO_BOT_PASSWORD = 'demo-bot-secure-password-2025!';

interface AgentConfig {
  name: string;
  model: string;
  persona: string;
  personaInstructions: string;
}

interface SeedRequest {
  topic: string;
  prompt: string;
  targetDate: string;
  agents: AgentConfig[];
  viewCountMin: number;
  viewCountMax: number;
  reactionCount: number;
  scenarioId: string;
}

const EMOJIS = ['🔥', '😂', '🤔', '🤯'];
const EMOJI_WEIGHTS = [0.4, 0.3, 0.2, 0.1];

function getRandomEmoji(): string {
  const rand = Math.random();
  let cumulative = 0;
  for (let i = 0; i < EMOJIS.length; i++) {
    cumulative += EMOJI_WEIGHTS[i];
    if (rand < cumulative) return EMOJIS[i];
  }
  return EMOJIS[0];
}

function generateUUID(): string {
  return crypto.randomUUID();
}

async function getOrCreateDemoUser(supabase: any): Promise<string> {
  // Try to find existing demo user
  const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers();
  
  if (listError) {
    console.error('Error listing users:', listError);
    throw new Error('Failed to list users');
  }

  const demoUser = existingUsers?.users?.find((u: any) => u.email === DEMO_BOT_EMAIL);
  
  if (demoUser) {
    console.log('Found existing demo user:', demoUser.id);
    return demoUser.id;
  }

  // Create demo user if not exists
  console.log('Creating demo user...');
  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email: DEMO_BOT_EMAIL,
    password: DEMO_BOT_PASSWORD,
    email_confirm: true,
    user_metadata: {
      display_name: 'AI Debates Bot',
      is_demo_account: true
    }
  });

  if (createError) {
    console.error('Error creating demo user:', createError);
    throw new Error('Failed to create demo user');
  }

  console.log('Created demo user:', newUser.user.id);
  
  // Also create a user_profile for the demo user
  const { error: profileError } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: newUser.user.id,
      display_name: 'AI Debates Bot'
    }, { onConflict: 'user_id' });

  if (profileError) {
    console.error('Error creating demo user profile:', profileError);
    // Don't throw, profile is not critical
  }

  return newUser.user.id;
}

async function callOpenRouter(
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[]
): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://lovable.dev',
      'X-Title': 'Magnus Froste Labs - Seed Debates'
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 500,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openRouterKey = Deno.env.get('OPENROUTER_API_KEY')!;

    if (!openRouterKey) {
      throw new Error('OPENROUTER_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: SeedRequest = await req.json();
    const {
      topic,
      prompt,
      targetDate,
      agents,
      viewCountMin,
      viewCountMax,
      reactionCount,
      scenarioId
    } = body;

    console.log(`Seeding debate: "${topic}" for date ${targetDate}`);

    // Get or create demo user
    const demoUserId = await getOrCreateDemoUser(supabase);
    console.log(`Using demo user: ${demoUserId}`);

    // Generate share_id
    const shareId = generateUUID().slice(0, 8);

    // Calculate random view count
    const viewCount = Math.floor(Math.random() * (viewCountMax - viewCountMin + 1)) + viewCountMin;

    // Parse target date
    const baseDate = new Date(targetDate);

    // Create the chat first
    const { data: chat, error: chatError } = await supabase
      .from('agent_chats')
      .insert({
        user_id: demoUserId,
        title: topic,
        prompt: prompt,
        scenario_id: scenarioId,
        settings: {
          numberOfAgents: agents.length,
          rounds: 2,
          responseLength: 'medium',
          participationMode: 'all',
          turnOrder: 'fixed'
        },
        is_public: true,
        share_id: shareId,
        view_count: viewCount,
        created_at: baseDate.toISOString(),
        updated_at: baseDate.toISOString()
      })
      .select()
      .single();

    if (chatError) {
      console.error('Error creating chat:', chatError);
      throw chatError;
    }

    console.log(`Created chat ${chat.id} with share_id ${shareId}`);

    // Generate conversation messages
    const messages: {
      agent: string;
      message: string;
      model: string;
      persona: string;
      created_at: string;
    }[] = [];

    let messageOffset = 0;
    const conversationHistory: { role: string; content: string }[] = [];

    // System prompt for all agents
    const systemPrompt = `You are participating in a multi-agent debate on the topic: "${topic}".
IMPORTANT: Always respond in English.
Be engaging, make strong arguments, and respond to other agents' points.
Keep your response concise (2-3 paragraphs max).
Do not use markdown formatting.`;

    // Round 1: Each agent gives initial take
    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      const agentLabel = `Agent ${String.fromCharCode(65 + i)}`; // A, B, C

      const agentSystemPrompt = `${systemPrompt}
You are ${agent.name} with the persona: ${agent.persona}.
${agent.personaInstructions}
${i === 0 ? 'You are starting the debate. Give your initial position.' : 'Respond to the previous arguments while presenting your own perspective.'}`;

      const messagesForApi = [
        { role: 'system', content: agentSystemPrompt },
        ...conversationHistory,
        { role: 'user', content: i === 0 ? `Start the debate on: ${prompt}` : 'Give your response to the discussion so far.' }
      ];

      console.log(`Generating response for ${agent.name} using ${agent.model}...`);
      
      const response = await callOpenRouter(openRouterKey, agent.model, messagesForApi);
      
      // Add to conversation history
      conversationHistory.push({
        role: 'assistant',
        content: `[${agent.name}]: ${response}`
      });

      // Add to messages array
      const messageDate = new Date(baseDate.getTime() + messageOffset * 60000);
      messages.push({
        agent: agentLabel,
        message: response,
        model: agent.model,
        persona: agent.persona,
        created_at: messageDate.toISOString()
      });

      messageOffset += Math.floor(Math.random() * 3) + 1; // 1-3 minutes between messages

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Round 2: Follow-up responses
    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      const agentLabel = `Agent ${String.fromCharCode(65 + i)}`;

      const agentSystemPrompt = `${systemPrompt}
You are ${agent.name} with the persona: ${agent.persona}.
${agent.personaInstructions}
This is the second round. Respond to the other agents' points, defend your position, or find common ground.`;

      const messagesForApi = [
        { role: 'system', content: agentSystemPrompt },
        ...conversationHistory,
        { role: 'user', content: 'Give your follow-up response to the discussion.' }
      ];

      console.log(`Generating follow-up for ${agent.name}...`);
      
      const response = await callOpenRouter(openRouterKey, agent.model, messagesForApi);
      
      conversationHistory.push({
        role: 'assistant',
        content: `[${agent.name}]: ${response}`
      });

      const messageDate = new Date(baseDate.getTime() + messageOffset * 60000);
      messages.push({
        agent: agentLabel,
        message: response,
        model: agent.model,
        persona: agent.persona,
        created_at: messageDate.toISOString()
      });

      messageOffset += Math.floor(Math.random() * 3) + 1;

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Insert all messages
    const messagesWithChatId = messages.map(m => ({
      ...m,
      chat_id: chat.id
    }));

    const { error: messagesError } = await supabase
      .from('agent_chat_messages')
      .insert(messagesWithChatId);

    if (messagesError) {
      console.error('Error inserting messages:', messagesError);
      throw messagesError;
    }

    console.log(`Inserted ${messages.length} messages`);

    // Generate reactions
    const reactions: {
      share_id: string;
      emoji: string;
      visitor_id: string;
      created_at: string;
    }[] = [];

    for (let i = 0; i < reactionCount; i++) {
      // Reactions happen 1-30 days after the debate
      const reactionDaysAfter = Math.floor(Math.random() * 30) + 1;
      const reactionDate = new Date(baseDate.getTime() + reactionDaysAfter * 24 * 60 * 60 * 1000);
      
      reactions.push({
        share_id: shareId,
        emoji: getRandomEmoji(),
        visitor_id: generateUUID(),
        created_at: reactionDate.toISOString()
      });
    }

    const { error: reactionsError } = await supabase
      .from('chat_reactions')
      .insert(reactions);

    if (reactionsError) {
      console.error('Error inserting reactions:', reactionsError);
      // Don't throw, reactions are not critical
    } else {
      console.log(`Inserted ${reactions.length} reactions`);
    }

    return new Response(JSON.stringify({
      success: true,
      chatId: chat.id,
      shareId,
      viewCount,
      messageCount: messages.length,
      reactionCount: reactions.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in seed-debates function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
