# V29.1 — Region Mini-map Fix

- The top-right mini-map automatically uses the colors of the currently active region.
- Shibuya is purple-gray, Shinjuku is ash-colored, and the final Cursed Shrine is dark red-purple instead of school green.
- The large Region Atlas also uses region-appropriate terrain colors; Jujutsu High keeps its existing detailed artwork.
- Switching regions, including admin/co-op travel, uses the newly selected region's terrain map and legend.
- The updated RPG script uses a new cache-busting version, so hard refreshes are not normally necessary.
- All V29 living buildings, V28 admin panel, friend rooms, and boss battles are unchanged.

Use the complete ZIP for a clean upload, or patch only `public/rpg.js`, `public/rpg.html` in the existing server folder on GitHub. Never place another numbered parent folder in the repository.
