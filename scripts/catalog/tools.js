export const builtInTools = Object.freeze([
  Object.freeze({
    id: "files",
    kind: "tool",
    title: "Files",
    name: "Files",
    description: "Browse the preview file model",
    icon: "▰",
    tagName: "melly-file-explorer",
    preferredSize: Object.freeze({ width: 760, height: 500 }),
    multiple: false,
  }),
  Object.freeze({
    id: "settings",
    kind: "tool",
    title: "Settings",
    name: "Settings",
    description: "Customize this desktop preview",
    icon: "⚙",
    tagName: "melly-settings",
    preferredSize: Object.freeze({ width: 650, height: 520 }),
    multiple: false,
  }),
]);

const toolsById = new Map(builtInTools.map((tool) => [tool.id, tool]));

export function getTool(toolId) {
  return toolsById.get(toolId) ?? null;
}

export function createLauncherCatalog(nativeApplications) {
  return [...builtInTools, ...nativeApplications];
}

export const dockItems = Object.freeze([
  Object.freeze({ id: "terminal", kind: "native", name: "Terminal", icon: ">_" }),
  builtInTools[0],
  Object.freeze({ id: "browser", kind: "native", name: "Browser", icon: "◎" }),
  builtInTools[1],
]);
