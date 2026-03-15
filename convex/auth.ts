import { query } from "./_generated/server";

export const viewer = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        return {
            tokenIdentifier: identity.tokenIdentifier,
            name: identity.name ?? undefined,
            email: identity.email ?? undefined,
            picture: identity.pictureUrl ?? undefined,
        };
    },
});

