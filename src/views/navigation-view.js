export function renderNavigation({ currentView, inboxCount, navInboxCount }) {
    document.querySelectorAll('[data-action="switch-view"]').forEach((link) => {
        const isActive = link.dataset.view === currentView;
        if (link.dataset.view === "inbox") {
            link.className = isActive
                ? "flex items-center justify-between px-4 py-3 rounded-2xl text-sm transition-all bg-stone-900 text-white font-medium shadow-md lowercase"
                : "flex items-center justify-between px-4 py-3 rounded-2xl text-sm transition-all text-stone-600 hover:text-stone-900 hover:bg-stone-50 lowercase";
        } else {
            link.className = isActive
                ? "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all bg-stone-900 text-white font-medium shadow-md lowercase"
                : "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all text-stone-600 hover:text-stone-900 hover:bg-stone-50 lowercase";
        }

        const icon = link.querySelector("svg");
        if (icon) {
            icon.classList.toggle("opacity-70", !isActive);
        }
    });

    navInboxCount.textContent = String(inboxCount);
    navInboxCount.className =
        currentView === "inbox"
            ? "bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px] font-bold transition-all"
            : "bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all";
}
