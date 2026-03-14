import { createInitialMessages, createAssistantConfigs } from "../data/assistant.js";
import { buildInitialTasks } from "../data/tasks.js";
import { TODAY, addDays, startOfWeekMonday, toLocalISODate } from "../utils/date.js";
import { cloneTask } from "./selectors.js";

export function createStore() {
    const initialTasks = buildInitialTasks();
    const initialInboxCount = initialTasks.filter((task) => task.status === "todo" && !task.dueAt).length;
    const assistantConfigs = createAssistantConfigs(initialInboxCount);

    return {
        initialTasks,
        assistantConfigs,
        state: {
            tasks: initialTasks.map(cloneTask),
            currentView: "inbox",
            upcomingWeekStart: toLocalISODate(startOfWeekMonday(addDays(TODAY, 1))),
            selectedUpcomingDate: toLocalISODate(addDays(TODAY, 1)),
            messagesByView: createInitialMessages(assistantConfigs),
            assistantOpen: true,
            modalTaskId: null,
            nextTaskId: initialTasks.length + 1,
            pendingUpcomingScrollTarget: null,
        },
    };
}
