"use strict";

const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const serverRoot = path.resolve(__dirname, "..");

function readDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL.trim();
  }

  try {
    const envFile = path.join(serverRoot, ".env");
    const raw = fs.readFileSync(envFile, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const match = line.match(/^\s*DATABASE_URL\s*=\s*(.*)\s*$/);
      if (!match) continue;
      let value = match[1].trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      return value;
    }
  } catch {
    // The Prisma CLI will surface a clear missing DATABASE_URL error.
  }

  return "";
}

const databaseUrl = readDatabaseUrl();
const isPostgres =
  databaseUrl.startsWith("postgresql://") ||
  databaseUrl.startsWith("postgres://");

let prismaArgs;
if (isPostgres) {
  prismaArgs = [
    "prisma",
    "migrate",
    "deploy",
    "--schema",
    "prisma/schema.postgresql.prisma",
  ];
} else {
  prismaArgs = [
    "prisma",
    "db",
    "push",
    "--schema",
    "prisma/schema.prisma",
    "--skip-generate",
  ];
}

const prisma = spawnSync("npx", prismaArgs, {
  cwd: serverRoot,
  stdio: "inherit",
  shell: process.platform === "win32",
});
if (prisma.error) throw prisma.error;
if (prisma.status !== 0) process.exit(prisma.status ?? 1);

const app = spawnSync(process.execPath, ["dist/src/main.js"], {
  cwd: serverRoot,
  stdio: "inherit",
  env: process.env,
});
if (app.error) throw app.error;
process.exit(app.status ?? 0);
