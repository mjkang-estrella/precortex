import { mkdirSync, writeFileSync } from "node:fs";

function normalizeValue(value) {
    return typeof value === "string" ? value : "";
}

export function buildPublicConfig(env = process.env) {
    const auth0Audience = normalizeValue(env.AUTH0_AUDIENCE);

    return {
        convexUrl: normalizeValue(env.CONVEX_URL),
        auth0Domain: normalizeValue(env.AUTH0_DOMAIN),
        auth0ClientId: normalizeValue(env.AUTH0_CLIENT_ID),
        ...(auth0Audience ? { auth0Audience } : {}),
    };
}

export function writePublicConfig(outputPath, env = process.env) {
    const config = JSON.stringify(buildPublicConfig(env), null, 2);
    const contents = `window.__APP_CONFIG__ = Object.freeze(${config});\n`;

    mkdirSync("dist", { recursive: true });
    writeFileSync(outputPath, contents, "utf8");
}

