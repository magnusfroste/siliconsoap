

# Synliggör gästaktivitet och drivkraft till signup

## Problem
Gästdebatter sparas bara i webbläsarens localStorage och loggas inte i databasen. Du har noll insyn i om besökare faktiskt testar plattformen. Analytics-tabellen visar 37 debatter -- alla fran inloggade anvandare.

## Losning: 3 delar

### Del 1: Fixa gast-analytik (sa du ser vad som hander)

Problemet ar att `analyticsRepository.logChatStart` inte explicit satter `user_id: null` for gaster, vilket gor att RLS-policyn `Allow guest analytics inserts` (som kraver `user_id IS NULL AND is_guest = true`) blockerar inserten tyst.

**Andring i `analyticsRepository.ts`:**
- Se till att `user_id` explicit satts till `null` for gastanvandare i `logChatStart`
- Lagg till `sessionId` for gaster (anvands redan men kan forbattras)

**Andring i RLS-policy:**
- Forenkla INSERT-policyn till en enda policy som tillater bade gaster (user_id IS NULL) och inloggade anvandare

### Del 2: Spara gastdebatter i databasen (sa de syns pa Explore)

**Databas-andring:**
- Uppdatera `agent_chats` RLS: Lagg till INSERT-policy for gaster via en edge function (service role)
- Uppdatera `agent_chat_messages` RLS: Tillat INSERT for meddelanden kopplade till gast-chattar

**Ny edge function `save-guest-debate`:**
- Tar emot debattdata (prompt, messages, settings, scenario)
- Sparar i `agent_chats` med `user_id = NULL`, `is_public = true`
- Genererar `share_id` automatiskt
- Sparar meddelanden i `agent_chat_messages`
- Returnerar share_id och chat_id

**Andring i frontend:**
- Efter att en gastdebatt ar klar, anropa edge function for att spara den
- Visa share-lank aven for gaster
- Gastdebatten syns automatiskt pa Explore-sidan (RLS tillater redan SELECT for publika chattar)

### Del 3: Lagg till signup-CTA efter gastdebatt

**Andring i `ChatView` / `ConversationComplete`:**
- Nar en gast har kort en debatt, visa en tydlig CTA: "Skapa konto for att spara dina debatter och fa fler credits"
- Visa hur manga credits som ar kvar for att skapa urgency

### Del 4: Admin-dashboard synlighet

**Andring i admin AnalyticsTab:**
- Visa gaststatistik separat: antal gastdebatter, conversion rate (gast -> signup)
- Visa topp-amnen fran gaster

## Tekniska detaljer

### Edge function: `save-guest-debate`
```text
POST /save-guest-debate
Body: { prompt, scenarioId, settings, messages[], sessionId }
Returns: { chatId, shareId }

Uses SUPABASE_SERVICE_ROLE_KEY to bypass RLS
Sets user_id = NULL, is_public = true
Auto-generates share_id
```

### Databasandringar
1. Ny RLS-policy pa `chat_analytics`: Forenkla INSERT till en policy
2. Ingen schemaandring behovs -- `agent_chats.user_id` ar redan nullable

### Frontendandringar
1. `analyticsRepository.ts` -- fixa user_id: null for gaster
2. `NewChatView.tsx` -- inga andringar (analytik-anropet fixas via repository)
3. `ChatView.tsx` -- anropa save-guest-debate nar gastdebatt ar klar
4. `ConversationComplete.tsx` -- lagg till signup-CTA for gaster
5. Admin `AnalyticsTab.tsx` -- visa gaststatistik

### Cleanup
- Lagg till feature flag `auto_save_guest_debates` (default: enabled) sa det kan slas av
- Gastdebatter aldre an 30 dagar kan rensas via en scheduled function (framtida forbattring)

## Resultat
- Du ser exakt hur manga gastbesokare som kor debatter
- Gastdebatter sparas och syns pa Explore-sidan (driver mer trafik)
- Gaster far en share-lank (viral spridning utan konto)
- Tydlig signup-CTA efter debatt (konvertering)
- Admin-panelen visar gast vs inloggad-statistik

