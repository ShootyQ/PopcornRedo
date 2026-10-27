# Butter Pop

An original, popcorn-inspired brick breaker for phones, tablets, and desktop browsers. Built with TypeScript, Canvas, and Vite. No runtime services, external fonts, or accounts. Includes 30 dense handcrafted levels; upgrades drop from 17.6% of destroyed bricks. The on-field Launch control appears only for a held ball, with Fire available during the laser upgrade.

## Develop

Requires Node.js 22.12+ (Node 24 recommended).

```sh
npm ci --cache /workspace/.npm-cache
npm run dev
```

Drag in the lower playfield, or use arrow keys. Tap Launch / Fire, or press Space. Escape pauses. Relaxed offers endless level retries; Classic has three lives. Progress saves separately as soon as the last breakable brick is cleared, before you tap to start the next batch. Returning to the menu or reloading restarts the saved level, not an in-flight ball.

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
