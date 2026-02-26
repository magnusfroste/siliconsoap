
# Dynamisk landningssida med feature flags

## Vad vi gor
Lagg till tva nya feature flags som styr om "Hall of Shame" och "Trending Debates" visas pa landningssidan. Detta gor det enkelt for vem som helst som sjalvhostar projektet att sjalv valja vilka sektioner som ska synas -- utan att andra kod.

## Steg

### 1. Skapa tva nya feature flags i databasen
Lagg till via en databasmigration:
- `show_landing_hall_of_shame` (enabled: true) -- Styr visning av Hall of Shame pa landningssidan
- `show_landing_trending_debates` (enabled: true) -- Styr visning av Trending Debates pa landningssidan

### 2. Uppdatera Landing.tsx
Anvand `useFeatureFlags` hooken for att lasa flaggorna och villkorligt rendera komponenterna:

```text
LandingHallOfShame    --> visas bara om show_landing_hall_of_shame ar enabled
FeaturedDebates       --> visas bara om show_landing_trending_debates ar enabled
```

### 3. Resultat
- Admin kan sla av/pa sektionerna fran /admin -> Features
- Nya installationer startar med bada aktiva
- Ingen kodandring behovs for att togla sektioner
