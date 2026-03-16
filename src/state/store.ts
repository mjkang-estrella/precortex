import { createInitialMessages, createAssistantConfigs } from "../data/assistant.js";
import { TODAY, addDays, startOfWeekMonday, toLocalISODate } from "../utils/date.js";
import { createProjectSetupState } from "./project-bay.js";

export function createStore() {
    const assistantConfigs = createAssistantConfigs(0);

    return {
        assistantConfigs,
        state: {
            tasks: [],
            projects: [],
            currentView: "inbox",
            selectedProjectId: null,
            upcomingWeekStart: toLocalISODate(startOfWeekMonday(addDays(TODAY, 1))),
            selectedUpcomingDate: toLocalISODate(addDays(TODAY, 1)),
            messagesByView: createInitialMessages(assistantConfigs),
            projectMessagesByProjectId: {},
            assistantOpen: true,
            mobileNavOpen: false,
            modalTaskId: null,
            modalSubtaskComposerOpen: false,
            modalSubtaskDraft: "",
            editingTaskId: null,
            editingTaskDraft: null,
            projectSetup: createProjectSetupState(),
            pendingUpcomingScrollTarget: null,
            auth: {
                status: "loading",
                user: null,
                errorMessage: null,
            },
        },
    };
}
