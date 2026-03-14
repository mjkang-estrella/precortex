export function renderNavigation({
    currentView,
    inboxCount,
    navInboxCount,
    projectNav,
    projects,
    selectedProjectId,
}) {
    document.querySelectorAll('[data-action="switch-view"]').forEach((link) => {
        const navigationLink = link as HTMLElement & { dataset: DOMStringMap };
        const isActive = navigationLink.dataset.view === currentView;
        if (navigationLink.dataset.view === "inbox") {
            navigationLink.className = isActive
                ? "flex items-center justify-between px-4 py-3 rounded-2xl text-sm transition-all bg-stone-900 text-white font-medium shadow-md lowercase"
                : "flex items-center justify-between px-4 py-3 rounded-2xl text-sm transition-all text-stone-600 hover:text-stone-900 hover:bg-stone-50 lowercase";
        } else {
            navigationLink.className = isActive
                ? "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all bg-stone-900 text-white font-medium shadow-md lowercase"
                : "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all text-stone-600 hover:text-stone-900 hover:bg-stone-50 lowercase";
        }

        const icon = navigationLink.querySelector("svg");
        if (icon) {
            icon.classList.toggle("opacity-70", !isActive);
        }
    });

    navInboxCount.textContent = String(inboxCount);
    navInboxCount.className =
        currentView === "inbox"
            ? "bg-white/20 text-white px-2 py-0.5 rounded-full text-[10px] font-bold transition-all"
            : "bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all";

    projectNav.innerHTML = projects
        .map((project) => {
            const isActive = currentView === "project" && selectedProjectId === project.id;
            const deadlineLabel = project.deadline ? project.deadline.slice(5) : "";
            return `
                <button
                    data-action="open-project"
                    data-project-id="${project.id}"
                    class="${
                        isActive
                            ? "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-sm transition-all bg-stone-900 text-white font-medium shadow-md lowercase"
                            : "w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-sm transition-all text-stone-600 hover:text-stone-900 hover:bg-stone-50 lowercase group"
                    }"
                    type="button"
                >
                    <span class="flex items-center gap-3 min-w-0">
                        <span class="w-2 h-2 rounded-full border-2 ${
                            isActive ? "border-white/70" : "border-stone-300 group-hover:border-stone-500"
                        } transition-colors"></span>
                        <span class="truncate">${project.name}</span>
                    </span>
                    ${
                        deadlineLabel
                            ? `<span class="${
                                  isActive ? "text-white/70" : "text-stone-400"
                              } text-[10px] font-semibold uppercase tracking-wider">${deadlineLabel}</span>`
                            : ""
                    }
                </button>
            `;
        })
        .join("");
}
