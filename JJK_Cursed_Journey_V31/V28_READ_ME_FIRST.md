# JJK Cursed Journey — V28 Friends + Admin

This builds on your existing V26/V27 game. The original solo RPG, maps, character sprites and classic arena are retained.

## Features

- Play solo with your existing browser save; or create/join a private code room for 2–6 friends. There is also a 1-player **admin solo room**.
- Choose your own 4–12-character code, or leave it empty to auto-generate one. Click **FRIEND ROOM** to see/copy the code and view teammates.
- Your teammates appear on the same map, with their selected sprites; boss fights include the entire party and use one shared HP bar. Everybody receives room XP and levels together when teammates defeat curses and bosses.
- The server divides party XP by a size-based difficulty multiplier: 2 players 2.2×, 3 players 2.4×, 4 players 2.7×, 5 players 3.0×, 6 players 3.4×. Multiple players contribute to the shared progress, so the result stays manageable.
- Every player can challenge the normal boss in their current map at any level in a friend room. The admin can summon **any** listed boss on **any** map, including Heian Sukuna, instantly bringing the party to the raid.
- **Owner-only admin panel** (server-password protected): XP drops for the whole room, spawn bosses, morph yourself or everyone into game sprites for 1/5/10/30 minutes (or until room exit).
- Morphs change character appearance; they do not add new individual character-specific movesets.

## Install into YOUR EXISTING GITHUB + RENDER service

1. **BACK UP** your current deployed game folder first. Do not delete the original project or change the Render service name.
2. In Render, open your existing JJK-Cursed-Journey-Fresh service, then **Settings → Root Directory**. This tells you the exact game folder Render currently runs. It may be `JJK-Cursed-Journey-Fresh 2` or `JJK-Cursed-Journey-Fresh 3`; use the actual value shown there.
3. On GitHub, open that **same existing folder** in your repository. Upload the contents of `JJK_V28_FRIENDS_ADMIN_PATCH.zip` there, preserving paths: `server.js`, `coop-server.js`, `package.json`, `public/rpg.js`, `public/rpg.html`, `public/rpg.css`, `public/coop-client.js`, and the `tests` files. **Replace existing files**. Don't create another `...Fresh 4` directory and don't upload the ZIP itself to GitHub.
4. In Render, open **Environment** for the same service. Add **ADMIN_KEY** and set it to a strong secret password you choose, **at least 12 characters**. Keep it secret! NEVER upload it to GitHub, include it in `index.html`, or post it in chat. Click **Save, rebuild, and deploy** if prompted.
5. Check your Render service's **Deploys** tab. If automatic deployments are disabled, choose **Manual Deploy → Deploy latest commit**. The existing `node server.js` start command works. The existing `npm install` build command also works (no third-party packages needed).
6. Once the service shows Live, open your same Render game link `https://jjk-cursed-journey-fresh.onrender.com/`. Refresh with Command+Shift+R on Mac to avoid old JS caching.

### Admin instructions

After you **Create a Code room** (or select **1 player (admin solo)**), press **Control + Shift + A** in the game. Enter the same ADMIN_KEY password you saved in Render. You will see the private **⚡ ADMIN** button afterwards. No one gets admin controls merely by being the room host or knowing your room code.

### IMPORTANT LIMITATIONS

- This is a session-based co-op feature. The shared room XP, level, invite code and spawned bosses live in the Render server's memory and reset if the server restarts or sleeps. Your existing **solo** save remains in your browser and is restored when you leave a room.
- Players can share their friend-room codes with each other; knowing a room code allows joining while space is available. Don't share codes publicly if you want private rooms.
- The map/world enemies still run locally per player, while XP grants and boss HP are synchronized through the server. This is **cooperative boss combat**, not a fully server-authoritative persistent MMO.
- Existing `/arena` 1v1, 2v2 and 3v3 battle modes stay separate from story co-op.

### Testing

If Node.js is installed, run `npm test` from the folder containing `package.json`. The test suite checks original arena/missions plus server-managed XP, admin authorization, timed morphs, group room cap and boss synchronization.
