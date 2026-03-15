import { existsSync, readFileSync } from "node:fs";

function parseEnvFile(contents) {
    const result = {};

    for (const line of contents.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;

        const separatorIndex = trimmed.indexOf("=");
        if (separatorIndex === -1) continue;

        const key = trimmed.slice(0, separatorIndex).trim();
        if (!key) continue;

        let value = trimmed.slice(separatorIndex + 1).trim();
        if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
        ) {
            value = value.slice(1, -1);
        }

        result[key] = value;
    }

    return result;
}

export function loadLocalEnv() {
    for (const filePath of [".env", ".env.local"]) {
        if (!existsSync(filePath)) continue;

        const values = parseEnvFile(readFileSync(filePath, "utf8"));
        for (const [key, value] of Object.entries(values)) {
            process.env[key] = value;
        }
    }
}
