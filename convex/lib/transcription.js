const ASSEMBLY_UPLOAD_URL = "https://api.assemblyai.com/v2/upload";
const ASSEMBLY_TRANSCRIPT_URL = "https://api.assemblyai.com/v2/transcript";
const DEFAULT_SPEECH_MODELS = ["universal-3-pro", "universal-2"];
const SUPPORTED_AUDIO_MIME_PREFIXES = [
    "audio/webm",
    "audio/mp4",
    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/x-wav",
    "audio/ogg",
    "audio/flac",
];

function cleanString(value) {
    return typeof value === "string" ? value.trim() : "";
}

export function isSupportedAudioMimeType(mimeType) {
    const normalized = cleanString(mimeType).toLowerCase();
    return SUPPORTED_AUDIO_MIME_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

export function validateVoiceNoteInput(audio, mimeType) {
    if (!(audio instanceof ArrayBuffer) || audio.byteLength === 0) {
        throw new Error("Audio is required.");
    }

    if (!isSupportedAudioMimeType(mimeType)) {
        throw new Error("Unsupported audio format.");
    }
}

async function parseJsonResponse(response) {
    const text = await response.text();
    const data = text ? JSON.parse(text) : {};

    if (!response.ok) {
        throw new Error(
            cleanString(data?.error) ||
                cleanString(data?.message) ||
                `AssemblyAI request failed with ${response.status}.`,
        );
    }

    return data;
}

async function uploadAudio({ apiKey, audio, fetchImpl }) {
    const response = await fetchImpl(ASSEMBLY_UPLOAD_URL, {
        method: "POST",
        headers: {
            authorization: apiKey,
            "content-type": "application/octet-stream",
        },
        body: audio,
    });

    const data = await parseJsonResponse(response);
    const uploadUrl = cleanString(data.upload_url);
    if (!uploadUrl) {
        throw new Error("AssemblyAI did not return an upload URL.");
    }

    return uploadUrl;
}

async function createTranscript({ apiKey, audioUrl, fetchImpl }) {
    const response = await fetchImpl(ASSEMBLY_TRANSCRIPT_URL, {
        method: "POST",
        headers: {
            authorization: apiKey,
            "content-type": "application/json",
        },
        body: JSON.stringify({
            audio_url: audioUrl,
            speech_models: DEFAULT_SPEECH_MODELS,
            language_detection: true,
        }),
    });

    const data = await parseJsonResponse(response);
    const transcriptId = cleanString(data.id);
    if (!transcriptId) {
        throw new Error("AssemblyAI did not return a transcript ID.");
    }

    return transcriptId;
}

export function normalizeTranscriptText(payload) {
    const text = cleanString(payload?.text);
    if (!text) {
        throw new Error("AssemblyAI returned an empty transcript.");
    }

    return text;
}

async function pollTranscript({
    apiKey,
    transcriptId,
    fetchImpl,
    sleepImpl,
    intervalMs,
    maxPollAttempts,
}) {
    for (let attempt = 0; attempt < maxPollAttempts; attempt += 1) {
        const response = await fetchImpl(`${ASSEMBLY_TRANSCRIPT_URL}/${transcriptId}`, {
            headers: {
                authorization: apiKey,
            },
        });

        const data = await parseJsonResponse(response);
        const status = cleanString(data.status).toLowerCase();

        if (status === "completed") {
            return normalizeTranscriptText(data);
        }

        if (status === "error") {
            throw new Error(cleanString(data.error) || "AssemblyAI could not transcribe the audio.");
        }

        if (attempt < maxPollAttempts - 1) {
            await sleepImpl(intervalMs);
        }
    }

    throw new Error("Voice transcription timed out.");
}

export async function transcribeWithAssemblyAi(audio, mimeType, options = {}) {
    validateVoiceNoteInput(audio, mimeType);

    const apiKey = cleanString(options.apiKey);
    if (!apiKey) {
        throw new Error("AssemblyAI is not configured.");
    }

    const fetchImpl = options.fetchImpl || fetch;
    const sleepImpl =
        options.sleepImpl ||
        ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
    const intervalMs = Number.isFinite(options.intervalMs) ? options.intervalMs : 3000;
    const maxPollAttempts = Number.isFinite(options.maxPollAttempts) ? options.maxPollAttempts : 40;

    const uploadUrl = await uploadAudio({ apiKey, audio, fetchImpl });
    const transcriptId = await createTranscript({ apiKey, audioUrl: uploadUrl, fetchImpl });

    return pollTranscript({
        apiKey,
        transcriptId,
        fetchImpl,
        sleepImpl,
        intervalMs,
        maxPollAttempts,
    });
}
