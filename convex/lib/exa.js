const EXA_SEARCH_URL = "https://api.exa.ai/search";

function cleanString(value) {
    return typeof value === "string" ? value.trim() : "";
}

function uniqueStrings(values, limit = 4) {
    const seen = new Set();
    const result = [];

    for (const value of values || []) {
        const text = cleanString(value);
        if (!text) continue;
        const key = text.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        result.push(text);
        if (result.length >= limit) break;
    }

    return result;
}

function normalizeResults(results = []) {
    return results
        .map((result) => {
            const title = cleanString(result?.title);
            const url = cleanString(result?.url);
            const highlights = uniqueStrings(result?.highlights, 3);

            if (!title || !/^https?:\/\//i.test(url)) {
                return null;
            }

            return {
                title,
                url,
                highlights,
            };
        })
        .filter(Boolean)
        .slice(0, 5);
}

export function shouldUseExaSearch(text = "") {
    const input = cleanString(text);
    if (!input) return false;

    return /\b(compare|research|find|lookup|look up|latest|current|best|top|options|what is|which|news|market|competitor|competitors|summarize|summary|brief)\b/i.test(
        input,
    ) || /\?/.test(input);
}

export function buildExaSearchContext(results = []) {
    if (!results.length) return "";

    return results
        .map((result, index) => {
            const highlightText = result.highlights.length
                ? `Highlights: ${result.highlights.join(" | ")}`
                : "Highlights: none";
            return [
                `Result ${index + 1}: ${result.title}`,
                `URL: ${result.url}`,
                highlightText,
            ].join("\n");
        })
        .join("\n\n");
}

export async function exaSearch(query, options = {}) {
    const apiKey = options.apiKey;
    if (!apiKey) {
        throw new Error("Exa is not configured.");
    }

    const response = await fetch(EXA_SEARCH_URL, {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "x-api-key": apiKey,
        },
        body: JSON.stringify({
            query,
            type: options.type || "auto",
            numResults: options.numResults || 5,
            contents: {
                highlights: {
                    maxCharacters: options.maxCharacters || 1200,
                },
            },
        }),
    });

    const text = await response.text();
    let data = null;

    try {
        data = JSON.parse(text);
    } catch {
        throw new Error(`Exa returned non-JSON response: ${text.slice(0, 280)}`);
    }

    if (!response.ok) {
        throw new Error(data?.error || data?.message || `Exa request failed with ${response.status}.`);
    }

    return normalizeResults(data?.results || []);
}
