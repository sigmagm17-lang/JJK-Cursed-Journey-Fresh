# JUJUTSU CURSED JOURNEY — V29: LIVING BUILDINGS

## What was added

This is the same V28 game and multiplayer server, now with original, interactive building interiors.

- **47 reachable building entrances across all seven maps.** A doorway and ENTER sign now mark each building.
- **Different NPCs with real dialogue choices.** Talk to them, ask about a local rumor, or ask for a clue.
- **Objects you can inspect** with a hint toward the room's hidden secret.
- **47 one-time building secrets** (one per physical building) with three-choice puzzles and short surprise reveals.
- **Original authored interactions** for the academy, dormitory, dojo, medical wing, archive, shop, shrine, street shops, apartments, warehouses, Shibuya buildings, station, forest cabins, ruined towers, and final shrine.
- **Forest ranger's cabin and herbalist hut** have been added to make the forest explorable too.
- **Indoor palette and decor vary** by building type. The dorm entrance was moved to an accessible side door.
- Solo discoveries award modest coins and XP only the first time; results are saved in the existing local solo save.
- Friends can explore the rooms too; interior lore and secrets are per-player discoveries in co-op, **not** extra party XP. Co-op party XP remains server-authoritative through bosses, contracts and admin actions.
- **V28 admin panel, friend codes, co-op boss fights, and existing solo progress are preserved.**

## Controls

1. Walk near the glowing ENTER mark on a building.
2. Press **E** (or **TALK** on mobile) to go inside.
3. Walk to a **person**, **clue**, or **secret box** and press **E**.
4. Talk to the NPC and inspect the clue to figure out the correct puzzle answer.
5. Walk south to the EXIT and press E to leave.

The current solo save key is unchanged (`jjk-cursed-grind-v23`) so V28 saved levels/quests survive in the same browser.

## Update an existing GitHub/Render deployment

For the smallest upload, extract `JJK_V29_LIVING_BUILDINGS_PATCH.zip`. Upload the files and folders **into the existing game root that Render uses** (where server.js and package.json already are), **replacing** the old matching files. Do not create a new nested folder like `Fresh 4`.

The patch changes `server.js`, `package.json`, `public/rpg.html`, `public/rpg.js`, `public/rpg.css`, adds `public/building-stories.js`, and adds/updates tests. Leave your V28 `public/sprites`, maps, `coop-server.js`, and other assets as they are.

To upload the full game instead, extract `JJK_V29_COMPLETE_GAME.zip` and upload all the contents of its single game folder (not the ZIP itself) to the Render root. Back up the existing repo first.

On Render keep **Language Node**, **Build Command `npm install`**, **Start Command `node server.js`**. Root Directory must point to the actual folder containing package.json.

The admin panel still requires the private `ADMIN_KEY` variable in Render. Never add your actual key to GitHub.

## Testing

`npm test` executes the existing story, co-op, combat and arena suites plus building-story tests. A separate real Chromium UI run checked all 47 entrance tiles and that they can be reached from each zone's quest NPC, conversations, clues, correct puzzle answers, saved rewards, and each region's room.

**Note:** This update is packaged locally. It has not yet been uploaded to your GitHub or deployed to your Render service.
