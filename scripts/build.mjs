import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { execSync } from "node:child_process";
import * as esbuild from "esbuild";
import { writePublicConfig } from "./generate-config.mjs";
import { loadLocalEnv } from "./load-env.mjs";

const buildDir = "build";

loadLocalEnv();

rmSync("dist", { recursive: true, force: true });
rmSync(buildDir, { recursive: true, force: true });
mkdirSync("dist", { recursive: true });

execSync("npx tailwindcss -i styles/input.css -o dist/tailwind.css --minify", {
    stdio: "inherit",
});

await esbuild.build({
    entryPoints: ["src/main.ts"],
    bundle: true,
    format: "esm",
    outfile: "dist/main.js",
    platform: "browser",
    sourcemap: true,
    target: ["es2022"],
});
writePublicConfig("dist/config.js");

mkdirSync(buildDir, { recursive: true });
cpSync("favicon.svg", `${buildDir}/favicon.svg`);
cpSync("index.html", `${buildDir}/index.html`);
cpSync("styles", `${buildDir}/styles`, { recursive: true });

if (existsSync("dist")) {
    cpSync("dist", `${buildDir}/dist`, { recursive: true });
}
