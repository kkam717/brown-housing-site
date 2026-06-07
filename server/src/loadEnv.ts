import { config } from "dotenv";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const srcDir = dirname(fileURLToPath(import.meta.url));
const serverEnv = resolve(srcDir, "../.env");
const rootEnv = resolve(srcDir, "../../.env");

if (existsSync(serverEnv)) {
  config({ path: serverEnv });
}
if (existsSync(rootEnv)) {
  config({ path: rootEnv, override: false });
}
