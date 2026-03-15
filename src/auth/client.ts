import { createAuth0Client } from "@auth0/auth0-spa-js";
import type { User } from "@auth0/auth0-spa-js";
import type { AppConfig } from "../config.js";

export type AuthUser = {
    name?: string;
    email?: string;
    picture?: string;
};

function toAuthUser(user: User | undefined | null): AuthUser | null {
    if (!user) return null;

    return {
        name: user.name,
        email: user.email,
        picture: user.picture,
    };
}

function hasRedirectParams(url: URL) {
    return url.searchParams.has("code") && url.searchParams.has("state");
}

function getAuthCallbackError(url: URL) {
    const error = url.searchParams.get("error");
    if (!error) return null;

    const description = url.searchParams.get("error_description");
    return description ? `${error}: ${description}` : error;
}

function isRecoverableAuthError(error: unknown) {
    const authError = error as { error?: string; code?: string } | null;
    const code = authError?.error || authError?.code;
    return code === "login_required" || code === "consent_required" || code === "missing_refresh_token";
}

export async function createAuthClient(config: AppConfig) {
    const authorizationParams: Record<string, string> = {
        redirect_uri: window.location.origin,
        scope: "openid profile email",
    };

    if (config.auth0Audience) {
        authorizationParams.audience = config.auth0Audience;
    }

    const client = await createAuth0Client({
        domain: config.auth0Domain,
        clientId: config.auth0ClientId,
        authorizationParams,
        cacheLocation: "localstorage",
        useRefreshTokens: true,
    });

    async function handleRedirectIfPresent() {
        const url = new URL(window.location.href);
        const callbackError = getAuthCallbackError(url);
        if (callbackError) {
            window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
            throw new Error(callbackError);
        }

        if (!hasRedirectParams(url)) return;

        await client.handleRedirectCallback(window.location.href);
        window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
    }

    async function initialize() {
        try {
            await handleRedirectIfPresent();

            const isAuthenticated = await client.isAuthenticated();
            if (!isAuthenticated) {
                return {
                    isAuthenticated: false,
                    user: null,
                };
            }

            return {
                isAuthenticated: true,
                user: toAuthUser(await client.getUser()),
            };
        } catch (error) {
            if (isRecoverableAuthError(error)) {
                return {
                    isAuthenticated: false,
                    user: null,
                };
            }

            throw error;
        }
    }

    return {
        initialize,
        async login() {
            await client.loginWithRedirect({
                authorizationParams: {
                    screen_hint: "login",
                },
            });
        },
        async logout() {
            await client.logout({
                logoutParams: {
                    returnTo: window.location.origin,
                },
            });
        },
        async getToken(options = { forceRefreshToken: false }) {
            try {
                const response = await client.getTokenSilently({
                    detailedResponse: true,
                    cacheMode: options.forceRefreshToken ? "off" : "on",
                });
                return response.id_token || null;
            } catch (error) {
                if (isRecoverableAuthError(error)) {
                    return null;
                }

                throw error;
            }
        },
        async getUser() {
            return toAuthUser(await client.getUser());
        },
    };
}

export type AuthClient = Awaited<ReturnType<typeof createAuthClient>>;

export function formatAuthError(error: unknown) {
    if (error instanceof Error) return error.message;
    return "Authentication failed. Check your Auth0 and Convex configuration.";
}
