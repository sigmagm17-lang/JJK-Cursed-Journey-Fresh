# JJK Cursed Journey V30 — 13 Admin Powers

This replaces V29.1 without removing friends, co-op, buildings, or minimap updates.

## Admin powers

The original 3: party XP, boss summons, timed character morphs.

10 NEW: coins for everyone, set party level, teleport party across 7 zones, full heal, refill cursed energy/cooldowns, 2x/3x timed XP events, 2x/3x timed coin events, boss full heal, smite boss for 25/50% max HP, and party-wide announcements.

## Open admin

In `/rpg.html`, CREATE a friend room (you can choose 1 Player Admin Solo). Click the **⚡ ADMIN** button at the top (no keyboard shortcut required). Enter the Render `ADMIN_KEY` and unlock. The server controls all actions and NEVER sends the password to other players.

## Installation (GitHub → Render)

1. Unzip this folder. Upload the INSIDE contents (`server.js`, `package.json`, `coop-server.js`, and the `public` and `tests` directories) to your GitHub repository, keeping the folder structure.
2. Render Root Directory should be the folder containing `server.js` and `package.json`.
3. Build Command `npm install`; Start Command `node server.js`.
4. In Render's Environment, set a strong, SECRET `ADMIN_KEY` (at least 12 characters). Do NOT put it in GitHub. Rotate it if it has been exposed.
5. Deploy and open `/rpg.html`.

WARNING: Friend rooms are temporary in-memory sessions; a Render restart resets them. Local solo saves remain separate. Admin actions only affect the current friend room.
