import type { MutationCtx, QueryCtx } from "../_generated/server";

type AuthCtx = MutationCtx | QueryCtx;

export async function requireOwnerId(ctx: AuthCtx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        throw new Error("Authentication required.");
    }

    return identity.tokenIdentifier;
}
