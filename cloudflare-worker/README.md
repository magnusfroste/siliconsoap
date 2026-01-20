# SiliconSoap Crawler Prerender Worker

Cloudflare Worker som serverar prerenderad HTML till crawlers för bättre SEO/AEO.

## Vad den gör

- **Crawlers** (Googlebot, Twitterbot, GPTBot, etc.) → Får prerenderad HTML med OG-tags, schema.org markup och full debatt-transkript
- **Vanliga användare** → Får React SPA som vanligt

## Installation

### 1. Skapa Worker

1. Gå till [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Välj din domän (siliconsoap.com)
3. Gå till **Workers & Pages** → **Create Worker**
4. Ge den ett namn, t.ex. `siliconsoap-prerender`
5. Klistra in koden från `crawler-prerender.js`
6. Klicka **Deploy**

### 2. Lägg till Route

1. Gå till **Workers Routes** i Cloudflare Dashboard
2. Klicka **Add Route**
3. Route: `siliconsoap.com/shared/*`
4. Worker: Välj `siliconsoap-prerender`
5. Spara

### 3. Verifiera

Testa med curl:

```bash
# Simulera Twitterbot
curl -A "Twitterbot/1.0" "https://siliconsoap.com/shared/0bupwwny" | head -50

# Simulera Googlebot
curl -A "Googlebot/2.1" "https://siliconsoap.com/shared/0bupwwny" | head -50

# Simulera vanlig användare (ska redirecta till SPA)
curl -A "Mozilla/5.0" "https://siliconsoap.com/shared/0bupwwny" -v
```

## Crawlers som detekteras

### Social Media
- Twitterbot, facebookexternalhit, LinkedInBot
- Slackbot, WhatsApp, TelegramBot, Discordbot
- PinterestBot, Mastodon, Bluesky

### Sökmotorer
- Googlebot, Bingbot, Baiduspider
- YandexBot, DuckDuckBot, Applebot

### AI/Answer Engines (AEO)
- GPTBot, ChatGPT-User, Claude-Web
- PerplexityBot, Grok, anthropic-ai
- Google-Extended, CCBot, Amazonbot

## Felsökning

### Se loggar
1. Cloudflare Dashboard → Workers → din worker
2. Klicka **Logs** eller **Real-time Logs**
3. Besök en `/shared/` URL och se loggarna i realtid

### Vanliga problem

| Problem | Lösning |
|---------|---------|
| 404 från prerender | Kontrollera att Supabase Edge Function är deployad |
| Worker körs inte | Kontrollera att route är korrekt konfigurerad |
| Fel HTML returneras | Verifiera SUPABASE_URL i worker-koden |

## Kostnad

- **Free tier**: 100,000 requests/dag (räcker gott)
- **Paid**: $5/mån för 10M requests om du växer ur free tier
