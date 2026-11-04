# After the Quiet — v1.6.1 Story Mode
A free-roam third-person horror action shooter by **Lone Keem Studios** (Three.js + Vite + Capacitor).
You play **Keem**, a kid with a backpack, fighting out of **Riverside, Maine** on the night it falls.

**Rated MATURE 18+** — intense violence, strong blood and gore (dismemberment, zombies eating people), gunfire, frightening scenes, death of a parent. A *Gore* toggle in Settings turns blood/dismemberment off.

```
npm install
npm run dev            # local
npm run build          # dist/
npm run android:debug  # APK  (android/app/build/outputs/apk/debug/)
npm run android:release# AAB  (needs the private upload keystore, never committed)
```
Debug: `?step=0..6` jumps to a chapter, `&god` gives weapons and invulnerability.

**Controls** — Touch: left joystick, drag to look, FIRE/HIT, AIM, JUMP, ROLL, RUN, CRCH, reload, swap, grenade, use, first-person toggle.
Keyboard/mouse: WASD, mouse look (click to lock), LMB attack, RMB aim, Shift run, C crouch, Space jump, Ctrl roll, R reload, Q swap, G grenade, H heal, E/F use, V camera, Esc pause. Gamepad: standard mapping.

**Progression** (localStorage `atq3.save`): loot cash/ammo/meds/grenades/comic pages, XP and levels with perks, Armory (in-game cash only — **no real money, no IAP**) for guns, melee, upgrades (damage, magazine, reload, accuracy/scope) and supplies, inventory screen, checkpoints per chapter.

Quality presets Low/Med/High with auto-detect (High adds GTAO + bloom). See STORY.md and CREDITS.md.
The old cinematic movie version is preserved at tag `cinematic-final`.


## v1.6.1
- Character customizer (title screen + Armory): 20+ outfits incl. original "The Boss", hair, faces, skin, backpacks; saved to `atq3.look`.
- Drivable player truck (Kenney Car Kit, CC0) with on-screen drive controls.
- Strong language with a Settings toggle (on / bleep / clean); voice lines regenerated (Kokoro stock voices).
- Heavier gore: bigger sprays, multi-limb dismemberment, gorier finishers.
- Feeding scenes: kneeling eaters with head dips and tearing, struggling victims, bite-synced spurts, growing pools, chew/tear SFX, eaters look up at Keem.
