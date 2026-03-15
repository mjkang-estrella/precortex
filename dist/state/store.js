import { createInitialMessages, createAssistantConfigs } from "../data/assistant.js";
import { buildInitialProjects } from "../data/projects.js";
import { buildInitialTasks } from "../data/tasks.js";
import { TODAY, addDays, startOfWeekMonday, toLocalISODate } from "../utils/date.js";
import { cloneProject, cloneTask } from "./selectors.js";
import { createProjectSetupState } from "./project-bay.js";
export function createStore() {
    const initialTasks = buildInitialTasks();
    const initialProjects = buildInitialProjects();
    const initialInboxCount = initialTasks.filter((task) => task.status === "todo" && !task.dueAt).length;
    const initialSubtaskCount = initialTasks.reduce((count, task) => count + task.subtasks.length, 0);
    const assistantConfigs = createAssistantConfigs(initialInboxCount);
    return {
        initialTasks,
        initialProjects,
        assistantConfigs,
        state: {
            tasks: initialTasks.map(cloneTask),
            projects: initialProjects.map(cloneProject),
            currentView: "inbox",
            selectedProjectId: null,
            upcomingWeekStart: toLocalISODate(startOfWeekMonday(addDays(TODAY, 1))),
            selectedUpcomingDate: toLocalISODate(addDays(TODAY, 1)),
            messagesByView: createInitialMessages(assistantConfigs),
            assistantOpen: true,
            mobileNavOpen: false,
            modalTaskId: null,
            modalSubtaskComposerOpen: false,
            modalSubtaskDraft: "",
            editingTaskId: null,
            editingTaskDraft: null,
            projectSetup: createProjectSetupState(),
            nextTaskId: initialTasks.length + 1,
            nextSubtaskId: initialSubtaskCount + 1,
            nextProjectId: initialProjects.length + 1,
            pendingUpcomingScrollTarget: null,
        },
    };
}
