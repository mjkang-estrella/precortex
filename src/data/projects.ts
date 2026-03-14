import { TODAY, addDays, toLocalISODate } from "../utils/date.js";

function createProject(id, name, offsetDays, summary, nextStep, createdLabel) {
    return {
        id,
        name,
        deadline: toLocalISODate(addDays(TODAY, offsetDays)),
        summary,
        nextStep,
        createdLabel,
        bayMessages: [
            {
                sender: "assistant",
                text: `i'm tracking ${name}. the clearest next move is still: ${nextStep.toLowerCase()}.`,
                rich: false,
                tasks: [],
            },
        ],
    };
}

export function buildInitialProjects() {
    return [
        createProject(
            "project-design-system",
            "design system",
            4,
            "Lock the core UI components so product work can move into implementation without reopening design decisions.",
            "Approve button and input spacing",
            "created last week",
        ),
        createProject(
            "project-marketing",
            "marketing",
            1,
            "Prepare the next client-facing story with cleaner metrics, sharper positioning, and a clear narrative arc.",
            "Collect the latest performance metrics",
            "created 3 days ago",
        ),
        createProject(
            "project-house-reno",
            "house reno",
            1,
            "Keep the renovation moving by resolving schedule risks before material deliveries and installs start drifting.",
            "List open questions for the contractor",
            "created 5 days ago",
        ),
        createProject(
            "project-finance",
            "finance",
            5,
            "Close the quarter cleanly and avoid last-minute finance surprises.",
            "Confirm tax estimate with accountant",
            "created 2 weeks ago",
        ),
        createProject(
            "project-personal",
            "personal",
            16,
            "Make the holiday travel decision while good routes are still available.",
            "Compare two preferred itineraries",
            "created last week",
        ),
        createProject(
            "project-career",
            "career",
            38,
            "Turn broad growth goals into a plan that can actually be reviewed and executed.",
            "Rewrite the growth goals in measurable terms",
            "created last month",
        ),
        createProject(
            "project-ops",
            "ops",
            2,
            "Keep routine team operations moving with less last-minute catch-up.",
            "Collect highlights from each stream",
            "created recently",
        ),
    ];
}
