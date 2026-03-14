import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { execSync } from "node:child_process";

const buildDir = "build";

rmSync("dist", { recursive: true, force: true });
rmSync(buildDir, { recursive: true, force: true });

execSync("tsc --project tsconfig.json", { stdio: "inherit" });

mkdirSync(buildDir, { recursive: true });
cpSync("index.html", `${buildDir}/index.html`);
cpSync("styles", `${buildDir}/styles`, { recursive: true });

if (existsSync("dist")) {
    cpSync("dist", `${buildDir}/dist`, { recursive: true });
}
