import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

export const runtime = "nodejs";

export async function GET() {
  const filePath = resolve(process.cwd(), "cli/termux-dev-cli.js");
  const file = await readFile(filePath, "utf8");

  return new NextResponse(file, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "public, max-age=60",
      "Content-Disposition": 'attachment; filename="termux-dev-cli.js"',
    },
  });
}
