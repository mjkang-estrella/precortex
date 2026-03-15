export type AppConfig = {
    convexUrl: string;
    auth0Domain: string;
    auth0ClientId: string;
    auth0Audience?: string;
};

declare global {
    interface Window {
        __APP_CONFIG__?: Partial<AppConfig>;
    }
}

export function getAppConfig(): AppConfig {
    const config = window.__APP_CONFIG__ ?? {};
    const missing = [];

    if (!config.convexUrl) missing.push("convexUrl");
    if (!config.auth0Domain) missing.push("auth0Domain");
    if (!config.auth0ClientId) missing.push("auth0ClientId");

    if (missing.length) {
        throw new Error(`Missing app config: ${missing.join(", ")}. Check dist/config.js.`);
    }

    return {
        convexUrl: config.convexUrl,
        auth0Domain: config.auth0Domain,
        auth0ClientId: config.auth0ClientId,
        auth0Audience: config.auth0Audience || undefined,
    };
}

