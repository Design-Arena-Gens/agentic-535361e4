#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-require-imports */

/**
 * Termux Dev CLI
 * ---------------
 * This CLI helps bootstrap a realistic development workflow inside Termux.
 * It installs the packages needed to run a desktop-class browser via Termux X11,
 * provisions helper scripts, and exposes commands to verify and launch the stack.
 *
 * The CLI is idempotent and safe to re-run. It stores lightweight state in
 * ~/.termux-dev/config.json so that subsequent runs can reuse previously
 * provisioned resources.
 */

const { spawnSync } = require("child_process");
const { existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync } = require("fs");
const { join } = require("path");

const CONFIG_DIR = join(process.env.HOME || process.env.USERPROFILE || ".", ".termux-dev");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");
const START_SCRIPT = join(CONFIG_DIR, "start-browser.sh");

const COMMANDS = ["help", "doctor", "setup", "browser:install", "browser:start", "browser:status"];

function assertTermux() {
  const prefix = process.env.PREFIX || "";
  if (!prefix.includes("com.termux")) {
    console.warn("⚠️  This workflow is tuned for Termux. Some commands may not behave elsewhere.");
  }
}

function runCommand(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    env: process.env,
    shell: false,
    ...options,
  });

  if (result.error) {
    console.error(`✖ Failed to run ${command}: ${result.error.message}`);
    process.exit(result.status ?? 1);
  }

  if (result.status !== 0) {
    console.error(`✖ Command "${command} ${args.join(" ")}" exited with code ${result.status}`);
    process.exit(result.status);
  }
}

function ensureConfig() {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }

  if (!existsSync(CONFIG_FILE)) {
    writeFileSync(
      CONFIG_FILE,
      JSON.stringify(
        {
          createdAt: new Date().toISOString(),
          lastSetupAt: null,
          x11RepoEnabled: false,
          browserPackage: null,
        },
        null,
        2,
      ),
      { mode: 0o600 },
    );
  }
}

function readConfig() {
  ensureConfig();
  return JSON.parse(readFileSync(CONFIG_FILE, "utf8"));
}

function writeConfig(nextConfig) {
  ensureConfig();
  writeFileSync(CONFIG_FILE, JSON.stringify(nextConfig, null, 2));
}

function updateConfig(callback) {
  const current = readConfig();
  const next = callback({ ...current });
  writeConfig(next);
}

function writeStartScript() {
  const script = `#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail

if ! command -v termux-x11 >/dev/null 2>&1; then
  echo "termux-x11 is required but missing. Run: termux-dev browser:install"
  exit 1
fi

if ! command -v pulseaudio >/dev/null 2>&1; then
  echo "pulseaudio is required but missing. Run: termux-dev browser:install"
  exit 1
fi

export DISPLAY=:0
export PULSE_SERVER=127.0.0.1

if ! pgrep -f termux-x11 >/dev/null 2>&1; then
  echo "Launching Termux X11 server..."
  termux-x11 :0 >/dev/null 2>&1 &
  sleep 2
fi

if ! pgrep -f pulseaudio >/dev/null 2>&1; then
  echo "Starting PulseAudio for sound..."
  pulseaudio --start --exit-idle-time=-1
fi

echo "Starting Chromium with developer flags..."
chromium \\
  --no-sandbox \\
  --enable-features=UseOzonePlatform \\
  --ozone-platform=wayland \\
  --remote-debugging-port=9222 \\
  --password-store=basic \\
  "$@"
`;

  writeFileSync(START_SCRIPT, script, { mode: 0o755 });
  chmodSync(START_SCRIPT, 0o755);
}

function handleDoctor() {
  assertTermux();

  const checks = [
    { name: "pkg", cmd: "pkg" },
    { name: "termux-info", cmd: "termux-info" },
    { name: "termux-x11", cmd: "termux-x11" },
    { name: "pulseaudio", cmd: "pulseaudio" },
    { name: "chromium", cmd: "chromium" },
  ];

  const status = checks.map(({ name, cmd }) => {
    const result = spawnSync("which", [cmd], { encoding: "utf8" });
    return { name, available: result.status === 0, path: result.stdout?.trim() || null };
  });

  console.log("Termux Dev Doctor");
  console.log("-----------------");

  status.forEach(({ name, available, path }) => {
    if (available) {
      console.log(`✔ ${name} detected at ${path}`);
    } else {
      console.log(`✖ ${name} not found`);
    }
  });

  console.log("");
  console.log("Next steps:");
  console.log("  • Run `termux-dev setup` to install core Termux tooling.");
  console.log("  • Run `termux-dev browser:install` to provision Chromium + X11.");
}

function handleSetup() {
  assertTermux();
  console.log("▶ Updating Termux package list...");
  runCommand("pkg", ["update", "-y"]);
  runCommand("pkg", ["upgrade", "-y"]);

  console.log("▶ Installing developer essentials...");
  runCommand("pkg", ["install", "-y", "git", "nodejs-lts", "python", "openssl-tool", "proot-distro", "wget", "tsu"]);

  updateConfig((config) => ({
    ...config,
    lastSetupAt: new Date().toISOString(),
  }));

  console.log("✔ Core developer toolchain is ready.");
  console.log("   Continue with `termux-dev browser:install` to enable the GUI browser.");
}

function handleBrowserInstall() {
  assertTermux();
  console.log("▶ Enabling X11 and Tur repos...");
  runCommand("pkg", ["install", "-y", "x11-repo"]);
  runCommand("pkg", ["install", "-y", "tur-repo"]);

  console.log("▶ Installing Termux X11 server and dependencies...");
  runCommand("pkg", ["install", "-y", "termux-x11-nightly", "pulseaudio", "mesa"]);

  console.log("▶ Installing Chromium for Termux...");
  runCommand("pkg", ["install", "-y", "chromium"]);

  writeStartScript();
  updateConfig((config) => ({
    ...config,
    x11RepoEnabled: true,
    browserPackage: "chromium",
  }));

  console.log("");
  console.log("✔ Browser stack installed.");
  console.log(`   Launch it with: ${START_SCRIPT}`);
  console.log("   or run `termux-dev browser:start` for the default launch flow.");
}

function handleBrowserStart(args) {
  assertTermux();
  ensureConfig();
  if (!existsSync(START_SCRIPT)) {
    writeStartScript();
  }

  const extraArgs = args.length > 0 ? args : [];

  console.log("▶ Bootstrapping desktop-class Chromium…");
  runCommand("bash", [START_SCRIPT, ...extraArgs], { stdio: "inherit" });
}

function handleBrowserStatus() {
  const processes = [
    { label: "termux-x11", pattern: "termux-x11" },
    { label: "pulseaudio", pattern: "pulseaudio" },
    { label: "chromium", pattern: "chromium" },
  ];

  console.log("Termux Browser Status");
  console.log("---------------------");

  processes.forEach(({ label, pattern }) => {
    const result = spawnSync("pgrep", ["-fl", pattern], { encoding: "utf8" });
    if (result.status === 0 && result.stdout.trim().length > 0) {
      const lines = result.stdout.trim().split("\n");
      lines.forEach((line) => console.log(`✔ ${label} running - ${line}`));
    } else {
      console.log(`✖ ${label} not running`);
    }
  });

  console.log("");
  console.log("Use `termux-dev browser:start` to launch or relaunch the browser session.");
}

function printHelp() {
  console.log("Termux Dev CLI");
  console.log("==============");
  console.log("");
  console.log("Usage:");
  console.log("  termux-dev <command> [options]");
  console.log("");
  console.log("Commands:");
  console.log("  help               Show this message");
  console.log("  doctor             Inspect Termux requirements and installed tooling");
  console.log("  setup              Install base developer dependencies (git, node, python, etc.)");
  console.log("  browser:install    Provision X11, PulseAudio, and the Chromium browser");
  console.log("  browser:start      Launch Chromium with developer flags via Termux X11");
  console.log("  browser:status     Check the running status of X11/PulseAudio/Chromium");
  console.log("");
  console.log("Examples:");
  console.log("  termux-dev setup");
  console.log("  termux-dev browser:install");
  console.log("  termux-dev browser:start --incognito https://developer.chrome.com");
}

function main() {
  ensureConfig();
  const [, , rawCommand = "help", ...args] = process.argv;

  if (!COMMANDS.includes(rawCommand)) {
    console.error(`Unknown command "${rawCommand}". Available commands: ${COMMANDS.join(", ")}`);
    process.exit(1);
  }

  switch (rawCommand) {
    case "help":
      printHelp();
      break;
    case "doctor":
      handleDoctor();
      break;
    case "setup":
      handleSetup();
      break;
    case "browser:install":
      handleBrowserInstall();
      break;
    case "browser:start":
      handleBrowserStart(args);
      break;
    case "browser:status":
      handleBrowserStatus();
      break;
    default:
      printHelp();
  }
}

main();
