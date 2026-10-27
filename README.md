# Butter Pop

An original, popcorn-inspired brick breaker for phones, tablets, and desktop browsers. Built with TypeScript, Canvas, and Vite. No runtime services, external fonts, or accounts. Includes 30 dense handcrafted levels; ordinary upgrade drops have a 8% chance per brick destroyed directly by the ball, with separate guaranteed Classic extra-life opportunities. The on-field Launch control appears only for a held ball, with Fire available during the laser upgrade.

## Develop

Requires Node.js 22.12+ (Node 24 recommended).

```sh
npm ci --cache /workspace/.npm-cache
npm run dev
```

Drag in the lower playfield, or use arrow keys. Tap Launch / Fire, or press Space. You can also drag directly on Fire to move the paddle; dragging does not shoot. Escape pauses. Relaxed offers endless level retries; Classic has three lives. Progress saves separately as soon as the last breakable brick is cleared, before you tap to start the next batch. Returning to the menu or reloading restarts the saved level, not an in-flight ball.

## Verify

```sh
npm test
npm run build
npm run test:browser
```

Browser checks use Chromium at `/usr/bin/chromium` by default. Set `CHROMIUM_PATH` to another installed Chromium executable if needed. They automatically start Vite. Tests cover phone, tablet, landscape, desktop, touch input, pause/resume, and saved progress. Real iOS/Android device playtesting and subjective campaign difficulty tuning are still recommended.

## Deploy

Upload `dist/` after `npm run build` to a static host. Vite uses relative asset paths so the game can be hosted in a subdirectory. No environment variables or backend are required.

## Game structure

`src/game.ts` owns rules and active-time timers. Physics, handcrafted level data, rendering, audio, and versioned local persistence are separate modules. The renderer uses original procedural artwork; audio is synthesized after a user gesture. Storage and audio failures degrade gracefully.

## GitHub Pages

Pushes to `main` run the rule tests, build, and deploy through `.github/workflows/pages.yml`. The intended project URL is https://shootyq.github.io/PopcornRedo/; the account's main site is preserved. If automatic Pages enablement is unavailable, choose **GitHub Actions** under repository Settings → Pages, then rerun the deployment workflow.

## Build number

The game frame shows **Build N** on the menu and throughout play, including phone landscape. N is the GitHub Actions workflow run number, embedded at build time so it identifies the version actually loaded. Reruns show an attempt suffix (for example, Build 12.2). Local development displays Build DEV; local production builds display Build LOCAL. Match player reports to the numbered deployment in Actions.

## Screen and fullscreen behavior

Every screen fits the viewport without document or menu scrolling. Start/Continue requests browser fullscreen directly from the player's tap. Unsupported or denied requests fall back to the same viewport-filling game. Pause offers Enter/Exit fullscreen where supported and a sound toggle. Leaving fullscreen through the browser pauses play; returning to the menu exits fullscreen. Browser fullscreen support varies on iPhone, so Safari may retain its browser bars. Menus scale to fit short landscape screens, and safe-area padding keeps controls away from notches.

## Local progress

The browser stores separate Relaxed and Classic checkpoints and the last chosen mode, with a second local backup. The menu shows each mode's saved batch. Checkpoints update on level changes, lives, pause, and leaving the page; returning starts the saved batch from the beginning. Old saves are migrated and each mode is recovered independently if another record is invalid. If browser storage is unavailable, the menu and pause screen say so and the in-memory game remains playable. Local progress belongs to the same browser/profile and site; it does not sync between browsers or devices, and clearing website data removes it.

## Controllers

Pair a Nintendo Switch Pro Controller through the device's Bluetooth settings (hold the small Sync button on top until its lights cycle), or connect a supported controller over USB on a computer. Open the game and press a controller button so the browser can discover it. Look for **CONTROLLER CONNECTED** above the playfield.

- Left stick or D-pad: move the paddle. In menus, directions change the focused button.
- A or B: launch, fire, or activate a menu button. Hold either to keep firing lasers; releasing and pressing again is required to launch a held ball.
- + / Start: pause or resume with the countdown.

The game uses the browser's standard Gamepad mapping and accepts both bottom/right face buttons to accommodate Nintendo label differences. Unmapped controllers display a message instead of guessing their layout. Disconnecting pauses play; reconnecting never resumes or launches automatically. Touch, mouse, and keyboard continue to work. Browser and device support varies, especially for individual Joy-Cons. Browser audio/fullscreen restrictions can require one initial screen tap or mouse click. Physical controller behavior must still be checked on the target device.

## Auto-fire lasers

Open **Options** on the menu or while paused to toggle **Auto-fire lasers**. It defaults off, saves locally, and fires at the normal four-volley-per-second rate while the laser upgrade is active and a ball is in flight. It stops on pause, upgrade expiry, or loss of all balls, and never launches a held ball. Manual and controller firing share the same cooldown.

## Safety Net, Butter Bomb, and extra lives

- **Safety Net:** at most one offer per campaign in each mode. Catch it to arm a green mesh at the bottom. It bounces one missed ball back into play without costing a life, then disappears. An armed net carries across levels and browser restarts; an offered or spent net cannot drop again. New campaigns reset the allowance.
- **Butter Bomb:** half the random-drop weight of a common upgrade. Catching it loads the next paddle hit with an explosive ball. Its next breakable-brick impact clears a small 3×3 cluster, including tough bricks, and can trigger explosive chains. Indestructible bricks stay intact. The golden paddle and ball ring show the loaded charge. Bombs have no timer; unused charges reset with a lost last ball or a new level.
- **Classic extra lives:** each level gets one +1-life drop, with a 25% chance of a second. They appear around 35% and 70% of bricks destroyed; no random-pool life drops can exceed the allowance. Missed pickups count as issued. The quota and issued count persist on reload, so reopening a level cannot reroll or farm them. Relaxed mode keeps unlimited retries and has no extra-life drops.

## Drop balance

Ordinary upgrades have an 8% roll on direct ball kills, with at least two seconds of active play between drops. Laser pickups have one quarter the weight of common upgrades and cannot spawn while a laser is already falling or active. Laser kills, Butter Bomb blasts, and explosive-brick splash do not roll ordinary drops, preventing weapon refills from creating pickup floods. The promised Classic life-drop allowance still applies to all destruction sources; the campaign safety-net limit is unchanged.
