"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { requireOwnerId } from "./lib/auth";
import { transcribeWithAssemblyAi } from "./lib/transcription.js";

declare const process: {
    env: Record<string, string | undefined>;
};

export const transcribeVoiceNote = action({
    args: {
        audio: v.bytes(),
        mimeType: v.string(),
    },
    handler: async (ctx, args) => {
        await requireOwnerId(ctx);

        const text = await transcribeWithAssemblyAi(args.audio, args.mimeType, {
            apiKey: process.env.ASSEMBLYAI_API_KEY,
        });

        return { text };
    },
});
