export function renderLandingPage() {
    return `
    <div class="landing-page min-h-screen w-full overflow-x-hidden">

        <!-- NAV -->
        <nav class="fixed top-0 left-0 right-0 z-50 px-6 sm:px-10 lg:px-16">
            <div class="mx-auto max-w-7xl flex items-center justify-between py-5 sm:py-6">
                <div class="flex items-center gap-2.5">
                    <div class="w-8 h-8 rounded-xl bg-stone-900 flex items-center justify-center">
                        <svg class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10"></path><path d="M12 8v4l3 3"></path><circle cx="19" cy="5" r="3" fill="currentColor" stroke="none"></circle></svg>
                    </div>
                    <span class="text-[15px] font-semibold tracking-tight text-stone-900 lowercase">precortex</span>
                </div>
                <button
                    data-action="login"
                    class="px-5 py-2.5 text-[13px] font-semibold tracking-tight text-stone-900 border border-stone-300 rounded-full hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all duration-300"
                    type="button"
                >
                    log in
                </button>
            </div>
        </nav>

        <!-- HERO -->
        <section class="relative min-h-[100svh] flex flex-col justify-center px-6 sm:px-10 lg:px-16 pt-24 pb-16">
            <div class="mx-auto max-w-7xl w-full">
                <div class="max-w-3xl landing-stagger">
                    <div class="landing-reveal" style="--reveal-i: 0">
                        <span class="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500 mb-6 sm:mb-8">Task planner with AI</span>
                    </div>
                    <h1 class="landing-reveal" style="--reveal-i: 1">
                        <span class="font-display text-[clamp(2.8rem,7vw,5.5rem)] leading-[1.05] tracking-tight text-stone-900 block">Think before</span>
                        <span class="font-display text-[clamp(2.8rem,7vw,5.5rem)] leading-[1.05] tracking-tight text-stone-500 block">the day starts</span>
                        <span class="font-display text-[clamp(2.8rem,7vw,5.5rem)] leading-[1.05] tracking-tight text-stone-900 block">moving.</span>
                    </h1>
                    <p class="landing-reveal mt-8 sm:mt-10 max-w-lg text-[clamp(1rem,1.8vw,1.125rem)] leading-[1.7] text-stone-600" style="--reveal-i: 2">
                        Precortex helps you organize projects, triage tasks, and plan your day — with an AI assistant that understands your priorities.
                    </p>
                    <div class="landing-reveal mt-10 sm:mt-12 flex flex-wrap items-center gap-4" style="--reveal-i: 3">
                        <button
                            data-action="login"
                            class="group px-7 py-4 bg-stone-900 text-white text-[14px] font-semibold tracking-tight rounded-2xl hover:bg-stone-800 transition-all duration-300 flex items-center gap-3"
                            type="button"
                        >
                            Get started
                            <svg class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                        </button>
                        <button
                            data-action="scroll-features"
                            class="px-5 py-4 text-[14px] font-medium tracking-tight text-stone-500 hover:text-stone-900 transition-colors duration-300"
                            type="button"
                        >
                            See how it works
                        </button>
                    </div>
                </div>
            </div>

            <!-- Scroll indicator -->
            <div class="absolute bottom-8 left-1/2 -translate-x-1/2 landing-reveal" style="--reveal-i: 5">
                <div class="w-[1px] h-10 bg-stone-300 landing-scroll-line"></div>
            </div>
        </section>

        <!-- FEATURES -->
        <section id="landingFeatures" class="px-6 sm:px-10 lg:px-16 py-20 sm:py-28 lg:py-36 bg-stone-900">
            <div class="mx-auto max-w-7xl">
                <div class="mb-16 sm:mb-24 max-w-xl">
                    <span class="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500 mb-5">How it works</span>
                    <h2 class="font-display text-[clamp(2rem,4.5vw,3.2rem)] leading-[1.12] tracking-tight text-white">
                        Your whole day,<br>in one calm place.
                    </h2>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-0 lg:gap-0">
                    <!-- Feature 1 -->
                    <div class="group py-10 lg:py-0 lg:pr-12 border-t border-stone-700/50 lg:border-t-0 lg:border-r">
                        <div class="flex items-baseline gap-4 mb-6">
                            <span class="font-display text-[2.5rem] text-stone-700">1</span>
                            <h3 class="font-display text-[1.35rem] text-white tracking-tight">Capture everything</h3>
                        </div>
                        <p class="text-[15px] leading-[1.75] text-stone-400 max-w-sm">
                            Tasks land in your inbox from any source. Voice notes, quick entries, AI suggestions — nothing slips through. Triage when you're ready.
                        </p>
                        <div class="mt-8 flex items-center gap-3">
                            <div class="flex items-center gap-2 px-3 py-1.5 bg-stone-800 rounded-lg text-[12px] text-stone-400">
                                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                                inbox
                            </div>
                            <div class="flex items-center gap-2 px-3 py-1.5 bg-stone-800 rounded-lg text-[12px] text-stone-400">
                                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path></svg>
                                voice
                            </div>
                        </div>
                    </div>

                    <!-- Feature 2 -->
                    <div class="group py-10 lg:py-0 lg:px-12 border-t border-stone-700/50 lg:border-t-0 lg:border-r">
                        <div class="flex items-baseline gap-4 mb-6">
                            <span class="font-display text-[2.5rem] text-stone-700">2</span>
                            <h3 class="font-display text-[1.35rem] text-white tracking-tight">Plan with clarity</h3>
                        </div>
                        <p class="text-[15px] leading-[1.75] text-stone-400 max-w-sm">
                            Schedule tasks to today, this week, or later. Group work into projects with deadlines. See your upcoming week at a glance — no clutter.
                        </p>
                        <div class="mt-8 flex items-center gap-2">
                            <span class="px-3 py-1.5 bg-stone-800 rounded-lg text-[12px] text-stone-400">today</span>
                            <span class="px-3 py-1.5 bg-stone-800 rounded-lg text-[12px] text-stone-400">tomorrow</span>
                            <span class="px-3 py-1.5 bg-stone-800 rounded-lg text-[12px] text-stone-400">next week</span>
                        </div>
                    </div>

                    <!-- Feature 3 -->
                    <div class="group py-10 lg:py-0 lg:pl-12 border-t border-stone-700/50 lg:border-t-0">
                        <div class="flex items-baseline gap-4 mb-6">
                            <span class="font-display text-[2.5rem] text-stone-700">3</span>
                            <h3 class="font-display text-[1.35rem] text-white tracking-tight">Ask your assistant</h3>
                        </div>
                        <p class="text-[15px] leading-[1.75] text-stone-400 max-w-sm">
                            An AI assistant sits alongside your workspace. Ask it to break down projects, suggest priorities, or draft next steps. It knows your context.
                        </p>
                        <div class="mt-8">
                            <div class="flex items-center gap-2 px-3 py-1.5 bg-stone-800 rounded-lg text-[12px] text-stone-400 w-fit">
                                <div class="w-5 h-5 rounded-full bg-stone-700 flex items-center justify-center">
                                    <svg class="w-3 h-3 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10"></path><path d="M12 8v4l3 3"></path></svg>
                                </div>
                                ai assistant
                                <span class="px-1.5 py-0.5 bg-stone-700 rounded text-[9px] font-bold tracking-wide uppercase text-stone-500">beta</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- EDITORIAL SECTION -->
        <section class="px-6 sm:px-10 lg:px-16 py-20 sm:py-28 lg:py-36">
            <div class="mx-auto max-w-7xl">
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">
                    <div>
                        <span class="inline-block text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500 mb-5">Philosophy</span>
                        <h2 class="font-display text-[clamp(1.8rem,3.5vw,2.8rem)] leading-[1.15] tracking-tight text-stone-900">
                            Not another productivity app.
                        </h2>
                    </div>
                    <div class="lg:pt-12">
                        <p class="text-[clamp(0.95rem,1.5vw,1.05rem)] leading-[1.8] text-stone-600 mb-8">
                            Most planners drown you in features. Precortex strips back to what matters: knowing what to do next, and having space to think about it.
                        </p>
                        <p class="text-[clamp(0.95rem,1.5vw,1.05rem)] leading-[1.8] text-stone-600 mb-10">
                            The inbox holds everything until you're ready to decide. Projects keep related work together. The AI doesn't automate your thinking — it supports it.
                        </p>
                        <div class="flex flex-col gap-5">
                            <div class="flex items-start gap-4">
                                <div class="w-1 h-1 rounded-full bg-stone-400 mt-[10px] flex-shrink-0"></div>
                                <span class="text-[14px] leading-[1.6] text-stone-700">Triage tasks on your terms, not the app's schedule</span>
                            </div>
                            <div class="flex items-start gap-4">
                                <div class="w-1 h-1 rounded-full bg-stone-400 mt-[10px] flex-shrink-0"></div>
                                <span class="text-[14px] leading-[1.6] text-stone-700">Voice capture for when typing breaks your flow</span>
                            </div>
                            <div class="flex items-start gap-4">
                                <div class="w-1 h-1 rounded-full bg-stone-400 mt-[10px] flex-shrink-0"></div>
                                <span class="text-[14px] leading-[1.6] text-stone-700">Real-time sync across devices, always current</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- CTA -->
        <section class="px-6 sm:px-10 lg:px-16 pb-20 sm:pb-28">
            <div class="mx-auto max-w-7xl">
                <div class="bg-stone-900 rounded-[32px] px-8 sm:px-14 lg:px-20 py-16 sm:py-20 lg:py-24 flex flex-col items-start lg:flex-row lg:items-end lg:justify-between gap-10">
                    <div class="max-w-lg">
                        <h2 class="font-display text-[clamp(2rem,4vw,3rem)] leading-[1.1] tracking-tight text-white mb-4">
                            Start your workspace.
                        </h2>
                        <p class="text-[15px] leading-[1.75] text-stone-400">
                            Free to use. Set up in under a minute.
                        </p>
                    </div>
                    <button
                        data-action="login"
                        class="group px-8 py-4 bg-white text-stone-900 text-[14px] font-semibold tracking-tight rounded-2xl hover:bg-stone-100 transition-all duration-300 flex items-center gap-3 flex-shrink-0"
                        type="button"
                    >
                        Get started
                        <svg class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </button>
                </div>
            </div>
        </section>

        <!-- FOOTER -->
        <footer class="px-6 sm:px-10 lg:px-16 pb-10">
            <div class="mx-auto max-w-7xl flex items-center justify-between py-6 border-t border-stone-200">
                <div class="flex items-center gap-2.5">
                    <div class="w-6 h-6 rounded-lg bg-stone-900 flex items-center justify-center">
                        <svg class="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10"></path><path d="M12 8v4l3 3"></path><circle cx="19" cy="5" r="3" fill="currentColor" stroke="none"></circle></svg>
                    </div>
                    <span class="text-[13px] font-medium tracking-tight text-stone-500 lowercase">precortex</span>
                </div>
                <span class="text-[12px] text-stone-400">2026</span>
            </div>
        </footer>
    </div>
    `;
}
