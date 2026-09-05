import { spawnSync } from "node:child_process";
import verifyDemo from "../tests/demo-browser.mjs";

// Uses a fresh browser profile, never the user's signed-in browser.
const session = `precortex-demo-${process.pid}`;
const baseUrl = process.env.DEMO_BASE_URL || "http://127.0.0.1:4187";
const cli = (...args) => {
    const result = spawnSync("npx", ["--yes", "--package", "@playwright/cli", "playwright-cli", `-s=${session}`, ...args], { encoding: "utf8" });
    if (result.status !== 0 || result.error) throw new Error(result.stderr || result.error?.message || result.stdout);
    return result.stdout;
};
try {
    cli("open", "about:blank");
    const code = verifyDemo.toString().replaceAll("http://127.0.0.1:4187", baseUrl);
    const output = cli("run-code", code);
    if (!output.includes('"result":"PASS"') || output.includes("### Error")) throw new Error(output);
    console.log(output.split("### Ran Playwright code")[0].trim());
} catch (error) {
    console.error(error.message);
    process.exitCode = 1;
} finally {
    cli("close");
}
