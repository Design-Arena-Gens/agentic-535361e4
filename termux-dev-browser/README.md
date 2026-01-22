## Termux Dev Browser CLI

This project ships a Node-based CLI that provisions a full Chromium browser (with DevTools + remote debugging) inside [Termux](https://termux.dev/), packaged with a Next.js front-end that documents the workflow and serves the CLI binary.

- **Frontend:** Next.js (App Router, Tailwind CSS)
- **CLI:** `cli/termux-dev-cli.js` – installs developer dependencies, Termux X11, PulseAudio, and Chromium, plus launch/status helpers.
- **Distribution:** `GET /api/cli` streams the latest CLI build so users can `curl` it directly from a Termux session.

## Production quickstart

```bash
curl -fsSL https://agentic-535361e4.vercel.app/api/cli -o termux-dev
chmod +x termux-dev
./termux-dev doctor
./termux-dev setup
./termux-dev browser:install
./termux-dev browser:start --remote-debugging-port=9222
```

The CLI stores its state in `~/.termux-dev/` and can be re-run safely.

## Local development

```bash
npm install
npm run dev
# Visit http://localhost:3000
```

Serve the CLI locally via `http://localhost:3000/api/cli`, or execute it directly:

```bash
npm run termux -- help
```

## Deployment

The project is ready for Vercel. Deploy with:

```bash
vercel deploy --prod --yes --token "$VERCEL_TOKEN" --name agentic-535361e4
```

Once deployed, verify the CLI endpoint:

```bash
curl -I https://agentic-535361e4.vercel.app/api/cli
```
