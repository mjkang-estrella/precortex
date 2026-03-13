export function getDefaultRoute(state) {
  if (!state.goals.length) {
    return { name: "onboarding" };
  }

  return { name: "today" };
}

export function parseHash(hash, state) {
  const fallback = getDefaultRoute(state);
  const cleanHash = (hash || "").replace(/^#/, "");

  if (!cleanHash || cleanHash === "/") {
    return fallback;
  }

  const parts = cleanHash.split("/").filter(Boolean);
  const [section, id] = parts;

  if (section === "onboarding") {
    return { name: "onboarding" };
  }

  if (section === "today") {
    return state.goals.length ? { name: "today" } : fallback;
  }

  if (section === "inbox") {
    return state.goals.length ? { name: "inbox" } : fallback;
  }

  if (section === "upcoming") {
    return state.goals.length ? { name: "upcoming" } : fallback;
  }

  if (section === "checkin") {
    return state.goals.length ? { name: "checkin" } : fallback;
  }

  if (section === "goal" && id) {
    const goal = state.goals.find((item) => item.id === id);
    return goal ? { name: "goal", goalId: id } : fallback;
  }

  return fallback;
}

export function routeToHash(route) {
  if (!route) {
    return "#/";
  }

  if (route.name === "goal") {
    return `#/goal/${route.goalId}`;
  }

  return `#/${route.name}`;
}

export function navigate(route) {
  const target = routeToHash(route);
  if (window.location.hash === target) {
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    return;
  }

  window.location.hash = target;
}
