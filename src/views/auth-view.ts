import { escapeHtml } from "../utils/text.js";

function renderShell(innerHtml: string) {
    return `
        <div class="min-h-screen w-full px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
            <div class="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl overflow-hidden rounded-[36px] border border-stone-200 bg-white shadow-soft">
                <div class="hidden lg:flex lg:w-[46%] flex-col justify-between bg-stone-900 px-10 py-10 text-white">
                    <div class="space-y-4">
                        <div class="inline-flex items-center rounded-full border border-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">
                            Precortex
                        </div>
                        <h1 class="font-display text-5xl tracking-tight">Think before the day starts moving.</h1>
                        <p class="max-w-md text-sm leading-7 text-white/72">
                            Log in to open your workspace, review priorities, and pick up where you left off.
                        </p>
                    </div>
                    <div class="space-y-3 text-sm text-white/60">
                        <div>Universal Login via Auth0</div>
                        <div>Backend identity verified by Convex</div>
                    </div>
                </div>
                <div class="flex flex-1 items-center justify-center bg-stone-50/70 px-6 py-10 sm:px-10">
                    <div class="w-full max-w-md rounded-[32px] border border-stone-200 bg-white p-8 shadow-soft sm:p-10">
                        ${innerHtml}
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function renderAuthLoading() {
    return renderShell(`
        <div class="space-y-5">
            <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Loading</div>
            <h2 class="font-display text-4xl tracking-tight text-stone-900">Checking your session.</h2>
            <p class="text-sm leading-7 text-stone-600">
                Validating your identity and connecting to your workspace.
            </p>
            <div class="flex items-center gap-3 pt-2 text-sm text-stone-500">
                <span class="h-2.5 w-2.5 animate-pulse rounded-full bg-stone-900"></span>
                <span>Auth0 and Convex are starting up.</span>
            </div>
        </div>
    `);
}

export function renderAuthScreen() {
    return renderShell(`
        <div class="space-y-6">
            <div class="space-y-3">
                <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Login</div>
                <h2 class="font-display text-4xl tracking-tight text-stone-900">Open your workspace.</h2>
                <p class="text-sm leading-7 text-stone-600">
                    Continue with email or Google through the hosted login flow.
                </p>
            </div>
            <button
                data-action="login"
                class="flex w-full items-center justify-center rounded-2xl bg-stone-900 px-5 py-3.5 text-sm font-medium text-white transition-colors hover:bg-stone-800"
                type="button"
            >
                Log in with Auth0
            </button>
            <p class="text-xs leading-6 text-stone-500">
                Make sure your Auth0 application allows <span class="font-medium text-stone-700">${escapeHtml(window.location.origin)}</span> as a callback and logout URL.
            </p>
        </div>
    `);
}

export function renderAuthError(message: string) {
    return renderShell(`
        <div class="space-y-6">
            <div class="space-y-3">
                <div class="text-[11px] font-semibold uppercase tracking-[0.18em] text-red-500">Auth error</div>
                <h2 class="font-display text-4xl tracking-tight text-stone-900">Login could not start.</h2>
                <p class="text-sm leading-7 text-stone-600">
                    ${escapeHtml(message)}
                </p>
            </div>
            <button
                data-action="login"
                class="flex w-full items-center justify-center rounded-2xl bg-stone-900 px-5 py-3.5 text-sm font-medium text-white transition-colors hover:bg-stone-800"
                type="button"
            >
                Retry login
            </button>
        </div>
    `);
}

