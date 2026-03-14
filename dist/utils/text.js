export function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
export function ordinalLabel(index) {
    const labels = ["1st", "2nd", "3rd", "4th", "5th"];
    return labels[index] || `${index + 1}th`;
}
