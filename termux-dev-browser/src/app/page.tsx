export default function Home() {
  const remoteCliUrl = "https://agentic-535361e4.vercel.app/api/cli";
  const localCliUrl = "http://localhost:3000/api/cli";

  const quickstart = [
    {
      title: "Download the CLI",
      command: `curl -fsSL ${remoteCliUrl} -o termux-dev && chmod +x termux-dev`,
      description:
        "Fetch the latest CLI build directly from this site and mark it as executable. When running locally, switch the URL to localhost.",
    },
    {
      title: "Inspect your environment",
      command: `./termux-dev doctor`,
      description:
        "Detects Termux essentials (pkg, termux-x11, Chromium, PulseAudio) and flags missing dependencies before deeper setup.",
    },
    {
      title: "Install the base toolchain",
      command: `./termux-dev setup`,
      description:
        "Updates pkg repositories and installs git, Node.js LTS, Python, proot-distro, and helpers you need for development.",
    },
    {
      title: "Provision the desktop browser",
      command: `./termux-dev browser:install`,
      description:
        "Enables the X11 and Tur repos, installs termux-x11, PulseAudio, Mesa, and Chromium, then generates a reusable launch script.",
    },
    {
      title: "Launch Chromium with DevTools",
      command: `./termux-dev browser:start --remote-debugging-port=9222`,
      description:
        "Boots the Termux X11 display server and Chromium with remote debugging enabled so you can attach desktop DevTools from another device.",
    },
  ];

  const features = [
    {
      title: "Opinionated Termux bootstrap",
      description:
        "Idempotent commands wire up repositories, install language runtimes, and keep a tiny config ledger in ~/.termux-dev.",
    },
    {
      title: "Desktop-class Chromium",
      description:
        "Launches Chromium via Termux X11 with Ozone + Wayland flags, persistent audio, and remote debugging for DevTools access.",
    },
    {
      title: "Self-hosted distribution",
      description:
        "The CLI binary is served straight from this site. No npm publish required—curl the script, chmod, and you are ready.",
    },
    {
      title: "Status + health checks",
      description:
        "Check running services at any time. The CLI surfaces which processes are alive so you can recover quickly after reboots.",
    },
  ];

  const commandReference = [
    {
      command: "termux-dev help",
      detail: "Summarises all available commands and usage examples.",
    },
    {
      command: "termux-dev doctor",
      detail: "Validates pkg tooling, X11, PulseAudio, and Chromium availability.",
    },
    {
      command: "termux-dev setup",
      detail: "Installs developer fundamentals and records the run in ~/.termux-dev/config.json.",
    },
    {
      command: "termux-dev browser:install",
      detail: "Installs Termux X11, enables repos, and provisions Chromium.",
    },
    {
      command: "termux-dev browser:start [chromium flags]",
      detail: "Launches Termux X11, PulseAudio, and Chromium with optional arguments.",
    },
    {
      command: "termux-dev browser:status",
      detail: "Prints process status for termux-x11, pulseaudio, and chromium.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-100 via-white to-white text-zinc-900">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 pb-24 pt-16 sm:px-10 lg:px-16">
        <section className="rounded-3xl border border-zinc-200 bg-white/80 p-10 shadow-xl shadow-zinc-200/40 backdrop-blur">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-6">
              <span className="inline-flex items-center rounded-full border border-zinc-300 bg-white px-4 py-1 text-sm font-medium uppercase tracking-wide text-zinc-500">
                Termux Dev Browser CLI
              </span>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Access a full desktop browser without leaving Termux.
              </h1>
              <p className="text-lg leading-relaxed text-zinc-600">
                Bootstrap Termux with a guided CLI that installs developer tooling, X11,
                PulseAudio, and Chromium. Use it to launch a desktop-class browser with
                DevTools and remote debugging, all from your Android device.
              </p>
            </div>
            <div className="flex flex-col gap-3 text-sm text-zinc-500">
              <div>
                <span className="font-semibold text-zinc-700">Remote download:</span>{" "}
                <a className="text-blue-600 hover:underline" href={remoteCliUrl}>
                  {remoteCliUrl}
                </a>
              </div>
              <div>
                <span className="font-semibold text-zinc-700">Local dev:</span>{" "}
                <code className="rounded bg-zinc-100 px-2 py-1 text-zinc-700">
                  {localCliUrl}
                </code>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold">Quickstart workflow</h2>
            <p className="mt-3 text-base text-zinc-600">
              Run each command in Termux. The CLI is idempotent, so you can re-run steps
              to recover from partial installs or device restarts.
            </p>
          </div>
          <div className="lg:col-span-3 space-y-6">
            {quickstart.map((item, idx) => (
              <div
                key={item.title}
                className="rounded-2xl border border-zinc-200 bg-white/70 p-6 shadow-sm shadow-zinc-200/60"
              >
                <div className="flex items-center justify-between text-sm text-zinc-500">
                  <span className="font-semibold text-zinc-700">{item.title}</span>
                  <span className="font-mono text-xs">Step {idx + 1}</span>
                </div>
                <pre className="mt-3 overflow-x-auto rounded-xl bg-zinc-950 px-4 py-3 text-sm text-zinc-100">
                  <code>{item.command}</code>
                </pre>
                <p className="mt-3 text-sm text-zinc-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-zinc-200 bg-zinc-950 px-8 py-10 text-zinc-200">
          <div className="grid gap-8 lg:grid-cols-4">
            {features.map((feature) => (
              <div key={feature.title} className="space-y-3">
                <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold">Command reference</h2>
            <p className="mt-3 text-base text-zinc-600">
              Prefix commands with <code className="rounded bg-zinc-100 px-2 py-1">./termux-dev</code>{" "}
              when running the downloaded script. If you install the package globally,
              the <code className="rounded bg-zinc-100 px-2 py-1">termux-dev</code> binary is available directly.
            </p>
          </div>
          <div className="lg:col-span-3 grid gap-4">
            {commandReference.map((cmd) => (
              <div
                key={cmd.command}
                className="rounded-2xl border border-zinc-200 bg-white/80 px-6 py-5 shadow-lg shadow-zinc-200/50"
              >
                <code className="text-sm font-semibold text-blue-600">{cmd.command}</code>
                <p className="mt-2 text-sm text-zinc-600">{cmd.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-dashed border-blue-300 bg-blue-50/70 p-8 text-blue-950">
          <h2 className="text-2xl font-semibold">Remote DevTools pairing</h2>
          <p className="mt-4 text-base leading-relaxed">
            When Chromium launches, it exposes DevTools over port 9222. Connect from a desktop
            machine using <code className="rounded bg-blue-100 px-2 py-1 text-blue-900">chrome://inspect</code> or{" "}
            <code className="rounded bg-blue-100 px-2 py-1 text-blue-900">npx devtools-frontend</code>.
            If you need to reach the Android device from another network, pair the CLI with
            your favourite tunneling solution (Cloudflared, Tailscale, or WireGuard).
          </p>
        </section>
      </main>
    </div>
  );
}
