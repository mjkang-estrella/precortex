import { mutation, query } from "./_generated/server";
import { requireOwnerId } from "./lib/auth";

const LEGACY_DEFAULT_PROJECTS = [
    {
        name: "design system",
        summary:
            "Lock the core UI components so product work can move into implementation without reopening design decisions.",
        nextStep: "Approve button and input spacing",
    },
    {
        name: "marketing",
        summary:
            "Prepare the next client-facing story with cleaner metrics, sharper positioning, and a clear narrative arc.",
        nextStep: "Collect the latest performance metrics",
    },
    {
        name: "house reno",
        summary:
            "Keep the renovation moving by resolving schedule risks before material deliveries and installs start drifting.",
        nextStep: "List open questions for the contractor",
    },
    {
        name: "finance",
        summary: "Close the quarter cleanly and avoid last-minute finance surprises.",
        nextStep: "Confirm tax estimate with accountant",
    },
    {
        name: "personal",
        summary: "Make the holiday travel decision while good routes are still available.",
        nextStep: "Compare two preferred itineraries",
    },
    {
        name: "career",
        summary:
            "Turn broad growth goals into a plan that can actually be reviewed and executed.",
        nextStep: "Rewrite the growth goals in measurable terms",
    },
    {
        name: "ops",
        summary: "Keep routine team operations moving with less last-minute catch-up.",
        nextStep: "Collect highlights from each stream",
    },
];

function isLegacyDefaultProject(project) {
    return LEGACY_DEFAULT_PROJECTS.some(
        (candidate) =>
            candidate.name === project.name &&
            candidate.summary === project.summary &&
            candidate.nextStep === project.nextStep,
    );
}

export const summary = query({
    args: {},
    handler: async (ctx) => {
        const ownerId = await requireOwnerId(ctx);
        const projects = await ctx.db
            .query("projects")
            .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
            .collect();
        const tasks = await ctx.db
            .query("tasks")
            .withIndex("by_owner_sort", (q) => q.eq("ownerId", ownerId))
            .collect();

        return {
            activeProjects: projects.filter((project) => !project.archivedAt).length,
            archivedProjects: projects.filter((project) => Boolean(project.archivedAt)).length,
            seededProjects: projects.filter(
                (project) => (project.source === "seed" || isLegacyDefaultProject(project)) && !project.archivedAt,
            ).length,
            totalTasks: tasks.length,
            completedTasks: tasks.filter((task) => task.status === "completed").length,
            inboxTasks: tasks.filter((task) => task.status === "todo" && !task.dueAt && !task.projectId).length,
        };
    },
});

export const removeSeededProjects = mutation({
    args: {},
    handler: async (ctx) => {
        const ownerId = await requireOwnerId(ctx);
        const now = Date.now();
        const projects = await ctx.db
            .query("projects")
            .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
            .collect();
        const seededProjectIds = new Set(
            projects
                .filter((project) => project.source === "seed" || isLegacyDefaultProject(project))
                .map((project) => project._id),
        );

        const tasks = await ctx.db
            .query("tasks")
            .withIndex("by_owner_sort", (q) => q.eq("ownerId", ownerId))
            .collect();

        for (const task of tasks) {
            if (!task.projectId || !seededProjectIds.has(task.projectId)) continue;

            await ctx.db.patch(task._id, {
                projectId: undefined,
                updatedAt: now,
            });
        }

        for (const project of projects) {
            if (!seededProjectIds.has(project._id)) continue;
            await ctx.db.delete(project._id);
        }

        return { removedSeededProjects: seededProjectIds.size };
    },
});
