import { AuthConfig } from "convex/server";

declare const process: {
    env: Record<string, string | undefined>;
};

export default {
    providers: [
        {
            domain: process.env.AUTH0_DOMAIN!,
            applicationID: process.env.AUTH0_CLIENT_ID!,
        },
    ],
} satisfies AuthConfig;
