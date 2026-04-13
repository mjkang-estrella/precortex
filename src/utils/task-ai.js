export function isAiSolvedVisible(task) {
    return task?.status !== "completed" && task?.aiAgent?.status === "solved" && task?.aiAgent?.highlighted;
}

export function getAiResultSummary(task) {
    return isAiSolvedVisible(task) ? task?.aiAgent?.resultSummary || "" : "";
}

export function hasAiResult(task) {
    return task?.aiAgent?.status === "solved" && Boolean(task?.aiAgent?.resultMarkdown);
}
