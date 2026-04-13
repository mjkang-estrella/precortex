import test from "node:test";
import assert from "node:assert/strict";

import {
    buildExaSearchContext,
    shouldUseExaSearch,
} from "../convex/lib/exa.js";

test("shouldUseExaSearch detects research and current-information prompts", () => {
    assert.equal(shouldUseExaSearch("compare the top 3 offline markdown apps"), true);
    assert.equal(shouldUseExaSearch("what is the latest news on OpenAI?"), true);
    assert.equal(shouldUseExaSearch("break down this task into first steps"), false);
    assert.equal(shouldUseExaSearch(""), false);
});

test("buildExaSearchContext formats multiple Exa results into prompt-safe text", () => {
    const context = buildExaSearchContext([
        {
            title: "Result One",
            url: "https://example.com/one",
            highlights: ["First point", "Second point"],
        },
        {
            title: "Result Two",
            url: "https://example.com/two",
            highlights: [],
        },
    ]);

    assert.match(context, /Result 1: Result One/);
    assert.match(context, /URL: https:\/\/example.com\/one/);
    assert.match(context, /Highlights: First point \| Second point/);
    assert.match(context, /Result 2: Result Two/);
});
