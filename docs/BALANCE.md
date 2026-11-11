# Our Home — Economy & Balance Reference

All balance constants are centralized in [`src/config/balance.ts`](../src/config/balance.ts).

## Core Parameters

| Parameter | Default | Code Key | Notes |
|---|---|---|---|
| Starting hearts | `150` | `BALANCE.startingHearts` | Enough to buy 2–3 basic decor pieces immediately |
| Heart bubble value | `1–3` | `BALANCE.bubbleValueMin` / `Max` | Scales with pet happiness (`<55` → 1, `55–79` → 2, `≥80` → 3) |
| Pet bubble interval | `4–8 min` | `BALANCE.petBubbleIntervalMin` / `Max` | Random per pet; max 1 queued bubble per pet |
| Pet happiness floor | `20` | `BALANCE.happinessMin` | Decays at `1.2 / hour`; never drops below 20 |
| Feed / pet happiness | `+16` / `+3` | `BALANCE.feedHappiness` / `petHappiness` | Petting has an `8 s` cooldown |
| Visitor roll interval | `20–45 min` | `BALANCE.visitorRollMin` / `Max` | Weighted by room attract tags and preferred rooms |
| Max simultaneous visitors | `2` | `BALANCE.maxVisitors` | Each visitor stays `3–15 min` |
| Offline accrual cap | `8 hours` | `BALANCE.offlineCap` | Simulated in 1-minute ticks on resume; no negative effects |
| Crop plot unlock costs | `150 / 400 / 900` | `BALANCE.plotUnlockCosts` | Plots 1–3 start unlocked; plots 4–6 padlocked |
| Room unlock costs | Nursery `800`, Studio `600`, Farm `500` | `BALANCE.roomUnlockCosts` | Living, Bedroom, Kitchen, Bathroom, Porch, Garden start free |
| Furniture price tiers | Basic `20–80`, Standard `100–400`, Premium `500–1500` | `src/data/items.ts` | Starter items are pre-placed in unlocked rooms |
| Refund on sell | `50%` | `BALANCE.refundRate` | Selling returns `floor(price × 0.5)` hearts |
| Recipe cook time | `2–15 min` | `src/data/recipes.ts` | 24 recipes across Side Dish, Main, and Dessert |
| Food match bonus | `×2 hearts` | `BALANCE.foodMatchMultiplier` | Feeding a visitor a dish from their favourite category doubles hearts |
| Autosave debounce | `2 s` | `BALANCE.autosaveDebounce` | Plus immediate flush on `visibilitychange` / `pagehide` |
| Local snapshots | Every `10 min`, keep `5` | `BALANCE.snapshotInterval` / `snapshotKeep` | Also triggered before selling, importing, or conflict resolution |
| Cloud sync delay | `30 s` | `BALANCE.cloudUploadDelay` | Debounced after local save when Auth0 + Supabase are configured |
