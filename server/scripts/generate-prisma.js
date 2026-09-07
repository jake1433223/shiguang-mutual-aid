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
    // No .env file yet; Prisma can still generate with its own defaults.
  }

  return "";
}

function schemaPath(databaseUrl) {
  if (
    databaseUrl.startsWith("postgresql://") ||
    databaseUrl.startsWith("postgres://")
  ) {
    return "prisma/schema.postgresql.prisma";
  }
  return "prisma/schema.prisma";
}

const schema = schemaPath(readDatabaseUrl());
const result = spawnSync(
  "npx",
  ["prisma", "generate", "--schema", schema],
  {
    cwd: serverRoot,
    stdio: "inherit",
    shell: process.platform === "win32",
  },
);

if (result.error) throw result.error;
process.exit(result.status ?? 0);
