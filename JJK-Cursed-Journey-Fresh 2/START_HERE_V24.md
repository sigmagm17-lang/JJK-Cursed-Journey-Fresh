# CURSED JOURNEY V24 — WORLD MAP & UI REBUILD, PHASE ONE

## What this update actually implements

- **Jujutsu High rebuilt** with a connected branching campus, school roofs, several detailed buildings and animated water textures, shaded forest routes, gardens, lanterns, torii gates, benches and illustrated pixel art.
- **Working entrances** into the academy, dojo, dormitory, archive, infirmary, equipment shop and shrine. Press **E** near each entrance; indoors press **E** at the south exit to return outdoors.
- **Three exploration secrets**: a woodland cache, forgotten shrine offering and archive stash. Press **E** next to each chest to receive a one-time coin reward. Claimed secrets save to the same browser progression record.
- **Compact UI** with a collapsible quest tracker, smaller top HUD, and mobile-friendly menu.
- **A real district atlas** sourced from the actual world map, with fog for unexplored 8x8 sectors, zoom and pan by scrolling. Quest guidance now points to active hunt targets/collectibles rather than always pointing back at the NPC.
- **Shibuya first art pass**: original pixel storefront façade assets, road textures, better alley connections and street props. The full Shibuya rebuild, enterable city shops and the remaining regions are **not completed**.

## Strict preservation promise

- No playable or enemy characters have been renamed, replaced, or rebalanced.
- Character PNGs, combat code (`public/game.js`), the quests/XP/coin/level/unlock rules (`public/rpg-core.js`), multiplayer handling, server matchmaking and existing 1v1/2v2/3v3 remain intact.
- Progress is stored under **the same localStorage key** (`jjk-cursed-grind-v23`) to preserve levels, coins, skins and quests when you deploy on the **same website address and browser**. New exploration keys are optional extras. If you switch to a different Render URL, browsers do not share localStorage between domains.

## Deploy to Render (existing project)

1. Download and unzip the complete V24 package.
2. Open the repository connected to your V22/V23 **Render web service** (such as `sigmagm17-lang/jjk-quest-v22`).
3. Upload the **contents** of the extracted ZIP, not the ZIP itself, preserving the `public/`, `public/world24/`, `public/sprites/` and `tests/` directory paths.
4. Commit to `main`. Render can auto-deploy, or use `Manual Deploy → Deploy latest commit`.
5. Open **`/story`** to test the world RPG. **`/arena`** remains multiplayer.
6. If your browser caches the old files, close/reopen the browser tab or refresh without cache.

## Offline play

Use `JJK_V24_School_World_Offline.html` supplied separately. Double-click it on a desktop browser. Browser security settings can affect saving when opened from `file://`. The online Render version saves normally within the same browser origin.

## Testing and limitations

- Automated browser tests passed for school NPC, first quest, three secret destinations, building entrance+exit, desktop/iPad/phone rendering, and zero console runtime exceptions.
- Every V24 school boss/quest item location is reachable from the starting area in the tested tile grid.
- Existing V23 server/combat/multiplayer tests pass.
- iPad and phone testing used **simulated device-size browsers**, not a physical device.
- Remaining regions still need fully handcrafted maps; only the school is the completed first region of the bigger redesign.
