

## Quick Prompts Admin Management

Move the suggested topics from hardcoded constants to a database-backed system where admins can curate, enable/disable, and add new prompts -- including trending topics.

### What changes

**1. New database table: `quick_prompts`**
- Columns: `id`, `topic` (text), `scenario_id` (text, e.g. "general-problem", "hot-debates"), `is_enabled` (boolean, default true), `sort_order` (integer), `created_at`, `updated_at`
- RLS: anyone can SELECT enabled prompts, admins can INSERT/UPDATE/DELETE
- Seed the table with existing hardcoded topics from `suggestedTopics.ts`

**2. New admin tab section or sub-tab: "Quick Prompts"**
- Add a new tab in AdminView (or a section within an existing tab) showing all quick prompts in a compact list
- Each row: topic text, scenario badge, enabled/disabled toggle (Switch)
- Add button to create new prompts (inline text input + scenario dropdown)
- Delete button for removing prompts
- Keep the list compact -- a simple table with toggle switches

**3. "Generate from trending" button**
- A button that calls an edge function using Lovable AI to generate 5-10 trending topic suggestions based on recent news
- Admin can review the suggestions and approve/add them individually
- Uses one of the supported Lovable AI models (e.g. gemini-2.5-flash)

**4. Frontend: Load quick prompts from database**
- Update `NewChatView` and related hooks to fetch enabled quick prompts from the database instead of using the hardcoded `suggestedTopics.ts`
- Keep `getRandomTopics()` logic for selecting a subset to display
- Fall back to hardcoded topics if the database has none

### Technical details

**Database migration:**
```sql
CREATE TABLE public.quick_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  scenario_id text NOT NULL DEFAULT 'general-problem',
  is_enabled boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.quick_prompts ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Anyone can view enabled prompts" ON public.quick_prompts
  FOR SELECT USING (is_enabled = true);

CREATE POLICY "Admins can view all prompts" ON public.quick_prompts
  FOR SELECT USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage prompts" ON public.quick_prompts
  FOR ALL USING (has_role(auth.uid(), 'admin'));
```

**New edge function: `generate-trending-topics`**
- Uses Lovable AI (gemini-2.5-flash) to generate debate-worthy trending topics
- Returns a list of topic suggestions the admin can review

**New admin component: `QuickPromptsTab`**
- Table listing all prompts with Switch toggles for enabled/disabled
- Inline add form (text input + scenario select + Add button)
- "Generate trending" button that fetches AI suggestions, shown as a reviewable list with "Add" buttons

**Updated files:**
- `src/pages/agents-meetup/views/AdminView.tsx` -- add Quick Prompts tab
- `src/pages/agents-meetup/views/admin/tabs/QuickPromptsTab.tsx` -- new component
- `src/pages/agents-meetup/views/admin/index.ts` -- export new tab
- `src/pages/agents-meetup/views/NewChatView.tsx` -- fetch prompts from DB
- `src/pages/agents-meetup/constants/suggestedTopics.ts` -- keep as fallback
- `supabase/functions/generate-trending-topics/index.ts` -- new edge function

