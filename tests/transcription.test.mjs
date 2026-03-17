import test from "node:test";
import assert from "node:assert/strict";

import {
    isSupportedAudioMimeType,
    normalizeTranscriptText,
    transcribeWithAssemblyAi,
    validateVoiceNoteInput,
} from "../convex/lib/transcription.js";

test("validateVoiceNoteInput rejects empty audio and unsupported formats", () => {
    assert.throws(() => validateVoiceNoteInput(new ArrayBuffer(0), "audio/webm"), /Audio is required/);
    assert.throws(
        () => validateVoiceNoteInput(new Uint8Array([1, 2, 3]).buffer, "text/plain"),
        /Unsupported audio format/,
    );
    assert.doesNotThrow(() =>
        validateVoiceNoteInput(new Uint8Array([1, 2, 3]).buffer, "audio/webm;codecs=opus"),
    );
});

test("isSupportedAudioMimeType handles known recording types", () => {
    assert.equal(isSupportedAudioMimeType("audio/webm;codecs=opus"), true);
    assert.equal(isSupportedAudioMimeType("audio/mp4"), true);
    assert.equal(isSupportedAudioMimeType("video/mp4"), false);
});

test("normalizeTranscriptText trims provider output", () => {
    assert.equal(normalizeTranscriptText({ text: "  hello world  " }), "hello world");
    assert.throws(() => normalizeTranscriptText({ text: "   " }), /empty transcript/);
});

test("transcribeWithAssemblyAi uploads, creates transcript, and polls to completion", async () => {
    const responses = [
        new Response(JSON.stringify({ upload_url: "https://cdn.example/audio.webm" }), { status: 200 }),
        new Response(JSON.stringify({ id: "transcript_123" }), { status: 200 }),
        new Response(JSON.stringify({ status: "queued" }), { status: 200 }),
        new Response(JSON.stringify({ status: "processing" }), { status: 200 }),
        new Response(JSON.stringify({ status: "completed", text: "  shipped from voice  " }), { status: 200 }),
    ];

    const requests = [];
    const text = await transcribeWithAssemblyAi(new Uint8Array([1, 2, 3]).buffer, "audio/webm", {
        apiKey: "test-key",
        intervalMs: 1,
        fetchImpl: async (url, options = {}) => {
            requests.push({ url, options });
            const response = responses.shift();
            if (!response) throw new Error("Unexpected extra fetch.");
            return response;
        },
        sleepImpl: async () => {},
        maxPollAttempts: 5,
    });

    assert.equal(text, "shipped from voice");
    assert.equal(requests.length, 5);
    assert.equal(requests[0].url, "https://api.assemblyai.com/v2/upload");
    assert.equal(requests[1].url, "https://api.assemblyai.com/v2/transcript");
    assert.equal(requests[2].url, "https://api.assemblyai.com/v2/transcript/transcript_123");
    assert.deepEqual(JSON.parse(requests[1].options.body).speech_models, ["universal-3-pro", "universal-2"]);
});

test("transcribeWithAssemblyAi surfaces provider errors and timeouts", async () => {
    await assert.rejects(
        () =>
            transcribeWithAssemblyAi(new Uint8Array([1]).buffer, "audio/webm", {
                apiKey: "test-key",
                fetchImpl: async (url) => {
                    if (url === "https://api.assemblyai.com/v2/upload") {
                        return new Response(JSON.stringify({ upload_url: "https://cdn.example/audio.webm" }), { status: 200 });
                    }

                    if (url === "https://api.assemblyai.com/v2/transcript") {
                        return new Response(JSON.stringify({ id: "transcript_456" }), { status: 200 });
                    }

                    return new Response(JSON.stringify({ status: "error", error: "bad audio" }), { status: 200 });
                },
                sleepImpl: async () => {},
                intervalMs: 1,
                maxPollAttempts: 2,
            }),
        /bad audio/,
    );

    await assert.rejects(
        () =>
            transcribeWithAssemblyAi(new Uint8Array([1]).buffer, "audio/webm", {
                apiKey: "test-key",
                fetchImpl: async (url) => {
                    if (url === "https://api.assemblyai.com/v2/upload") {
                        return new Response(JSON.stringify({ upload_url: "https://cdn.example/audio.webm" }), { status: 200 });
                    }

                    if (url === "https://api.assemblyai.com/v2/transcript") {
                        return new Response(JSON.stringify({ id: "transcript_789" }), { status: 200 });
                    }

                    return new Response(JSON.stringify({ status: "processing" }), { status: 200 });
                },
                sleepImpl: async () => {},
                intervalMs: 1,
                maxPollAttempts: 2,
            }),
        /timed out/,
    );
});
